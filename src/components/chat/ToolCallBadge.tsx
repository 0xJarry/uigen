"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  toolArgs?: Record<string, any>;
  state: string;
  result?: any;
}

function getToolDisplayMessage(toolName: string, toolArgs?: Record<string, any>): string {
  if (!toolArgs) return toolName;

  const fileName = toolArgs.path ? extractFileName(toolArgs.path) : '';

  switch (toolName) {
    case 'str_replace_editor':
      const command = toolArgs.command;
      switch (command) {
        case 'view':
          return fileName ? `📄 Viewing ${fileName}` : '📄 Viewing file';
        case 'create':
          return fileName ? `📝 Creating ${fileName}` : '📝 Creating file';
        case 'str_replace':
          return fileName ? `✏️ Editing ${fileName}` : '✏️ Editing file';
        case 'insert':
          return fileName ? `📝 Updating ${fileName}` : '📝 Updating file';
        case 'undo_edit':
          return fileName ? `↩️ Reverting ${fileName}` : '↩️ Reverting changes';
        default:
          return fileName ? `📄 Processing ${fileName}` : '📄 Processing file';
      }
    
    case 'file_manager':
      const fileCommand = toolArgs.command;
      switch (fileCommand) {
        case 'rename':
          const newFileName = toolArgs.new_path ? extractFileName(toolArgs.new_path) : '';
          if (fileName && newFileName) {
            return `📂 Renaming ${fileName} → ${newFileName}`;
          } else if (fileName) {
            return `📂 Renaming ${fileName}`;
          }
          return '📂 Renaming file';
        case 'delete':
          return fileName ? `🗑️ Deleting ${fileName}` : '🗑️ Deleting file';
        default:
          return fileName ? `📂 Managing ${fileName}` : '📂 Managing file';
      }
    
    default:
      return toolName;
  }
}

function extractFileName(path: string): string {
  if (!path) return '';
  
  // Handle both forward and backward slashes
  const segments = path.split(/[/\\]/);
  const fileName = segments[segments.length - 1];
  
  // Return the filename or fallback to the last segment
  return fileName || segments[segments.length - 2] || path;
}

export function ToolCallBadge({ toolName, toolArgs, state, result }: ToolCallBadgeProps) {
  const displayMessage = getToolDisplayMessage(toolName, toolArgs);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {state === "result" && result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      )}
    </div>
  );
}