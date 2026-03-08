import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, ArrowLeft, Search, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Tables } from "@/integrations/supabase/types";

type Message = Tables<"messages">;

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPartnerId = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartnerName, setSelectedPartnerName] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(!!selectedPartnerId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data: allMessages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!allMessages) return;

      const partnerMap = new Map<string, { msgs: Message[] }>();
      for (const msg of allMessages) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, { msgs: [] });
        partnerMap.get(partnerId)!.msgs.push(msg);
      }

      const partnerIds = Array.from(partnerMap.keys());
      if (partnerIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const convos: Conversation[] = partnerIds.map((pid) => {
        const { msgs } = partnerMap.get(pid)!;
        const profile = profileMap.get(pid);
        const unread = msgs.filter(
          (m) => m.receiver_id === user.id && !m.read_at
        ).length;
        return {
          partnerId: pid,
          partnerName: profile?.full_name || "Unknown User",
          partnerAvatar: profile?.avatar_url || null,
          lastMessage: msgs[0].content,
          lastMessageAt: msgs[0].created_at,
          unreadCount: unread,
        };
      });

      convos.sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );
      setConversations(convos);
    };

    fetchConversations();
  }, [user, messages]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!user || !selectedPartnerId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedPartnerId}),and(sender_id.eq.${selectedPartnerId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", selectedPartnerId)
        .eq("receiver_id", user.id)
        .is("read_at", null);
    };

    fetchMessages();

    // Fetch partner name
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", selectedPartnerId)
      .single()
      .then(({ data }) => setSelectedPartnerName(data?.full_name || "Unknown"));
  }, [user, selectedPartnerId]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            newMsg.sender_id === user.id ||
            newMsg.receiver_id === user.id
          ) {
            if (
              selectedPartnerId &&
              (newMsg.sender_id === selectedPartnerId ||
                newMsg.receiver_id === selectedPartnerId)
            ) {
              setMessages((prev) => [...prev, newMsg]);
              // Mark as read if we're viewing
              if (newMsg.sender_id === selectedPartnerId) {
                supabase
                  .from("messages")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", newMsg.id)
                  .then();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedPartnerId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedPartnerId || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selectedPartnerId,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectConversation = (partnerId: string) => {
    setSearchParams({ with: partnerId });
    setMobileShowChat(true);
  };

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="container flex-1 py-6">
        <h1 className="mb-6 font-serif text-2xl font-bold text-foreground">Messages</h1>

        <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {/* Conversation List */}
          <div
            className={`w-full flex-shrink-0 border-r border-border md:w-80 ${
              mobileShowChat && selectedPartnerId ? "hidden md:flex" : "flex"
            } flex-col`}
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((c) => (
                  <button
                    key={c.partnerId}
                    onClick={() => selectConversation(c.partnerId)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
                      selectedPartnerId === c.partnerId ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {c.partnerAvatar ? (
                        <img src={c.partnerAvatar} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        c.partnerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground truncate">
                          {c.partnerName}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={`flex flex-1 flex-col ${
              !mobileShowChat && !selectedPartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {selectedPartnerId ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <button
                    onClick={() => {
                      setMobileShowChat(false);
                      setSearchParams({});
                    }}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {selectedPartnerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-card-foreground">{selectedPartnerName}</span>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 font-serif text-lg font-bold text-muted-foreground">
                  Select a conversation
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
