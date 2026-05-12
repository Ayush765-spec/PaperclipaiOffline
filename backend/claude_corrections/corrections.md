Summary of problems and fixes:

Problem 1: Model doesnt support structured tool calls

Issue: The code sent tools to Ollama using OpenAI's /v1/chat/completions format eith tools parameter. However, llama3:latest doesnt support function calling in this format-it returns tools as plain JSON text in the content field.

Error: registry.ollama.ai/library/llama3:latest does not support tools

Fix:Changed agent model to qwen2.5-coder:latest which has better tool/function calling support and added fallback JSON parsing 

Problem 2: Tools calls Returned as JSON Text

Issue: Even with qwen2.5-code:latest, the model returned tool calls as plain JSON in the content field:{"name":"write_file","arguments":{"path":"output/hello.py","content":"..."}}

The original code only looked for tool calls in the structured tool_calls array:
if(!assistantMessage:tool_calls?.length){
    taskDone=true; //Bug:MArked as done even though tool call was in content 
    break;

}
Fix: Added JSON parsing fallback in ollama.adapter.ts:
let toolCalls=assistantMessage.tool_calls??[];
if(!toolCalls.length && assistantMessage.content){
    try{
        const parsed=JSON.parse(assistantMessage.content.trim());
        if(parsed && parsed.name && parsed.arguments){
            toolCalls=[{
                id:generateID(),
                function:{
                    name:String(parsed.name),
                    arguments:typeof parsed.arguments==='string'
                        ? parsed.arguments
                        :JSOn.stringify(parsed.arguments)
                }
            }];
            assistantMessage.content=null;
        }
    }catch{
        //NOT json ,regular text content 

    }
}
--Result
agent now properly parses tool calls from JSON text
Result:
-- Agent now properly parses tool calls from JSON text
-- Executes the tools(write_file,mark_task_done,etc)
-- Creates files as requested(output/hello.py was created successfully )