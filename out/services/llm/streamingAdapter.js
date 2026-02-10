"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultStreamParser = defaultStreamParser;
/**
 * Minimal streaming adapter utilities (SSE parsing helpers)
 * Lightweight helper to aggregate chunks and call onToken for every text chunk.
 */
function defaultStreamParser(stream, onToken) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    function read() {
        return reader.read().then((res) => {
            if (res.done)
                return;
            const chunk = decoder.decode(res.value, { stream: true });
            // naive split by newlines or delimiters; provider-specific adapters can refine
            onToken(chunk);
            return read();
        });
    }
    return read();
}
//# sourceMappingURL=streamingAdapter.js.map