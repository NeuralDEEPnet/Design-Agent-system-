# Solutions & Best Practices

## 1. Correct Gemini SDK Tool Configuration
**Date**: 2026-04-10
**Context**: Implementing Web Search and Custom API fetching.
**Solution**: 
Always place `tools` and `toolConfig` inside the `config` object when calling `generateContentStream`:
```typescript
const responseStream = await ai.models.generateContentStream({
  model: "gemini-3.1-pro-preview",
  contents: currentContents,
  config: {
    tools: [
      { googleSearch: {} },
      { functionDeclarations: [...] }
    ],
    toolConfig: { includeServerSideToolInvocations: true },
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
  }
});
```

## 2. Handling Function Calls in State
**Date**: 2026-04-10
**Context**: Storing function calls and responses in the chat history.
**Solution**:
Define a flexible `Part` type that accommodates the optional nature of the SDK's `FunctionCall`:
```typescript
type Part = 
  | { text: string }
  | { functionCall: { name?: string; args?: any } }
  | { functionResponse: { name: string; response: any } };
```
