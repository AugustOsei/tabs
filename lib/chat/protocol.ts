// Shared between /api/chat and the chat widget.

/** Questions allowed in one conversation before August wraps up. */
export const MAX_QUESTIONS = 12;

/**
 * The reply stream is plain text, followed by this separator and one JSON
 * object (ChatTrailer) describing the reply.
 */
export const TRAILER_SEPARATOR = "\u001e";

export type ChatTrailer = {
  /** Server signature for this reply. Sent back with the history so the server can tell real replies from forged ones. */
  sig: string | null;
  /** True when this reply was to an off-topic message. */
  off: boolean;
  /** True when the conversation has ended and no more questions are accepted. */
  closed: boolean;
};

export type ChatMessage = { role: "user"; content: string } | { role: "assistant"; content: string; sig?: string | null; off?: boolean };
