'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TiptapEditor({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        const safeValue = value || '';
        if (editor && value !== undefined && safeValue !== editor.getHTML()) {
            editor.commands.setContent(safeValue);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-outline/20 rounded-lg overflow-hidden bg-white dark:bg-surface-container">
            <div className="bg-surface-container-low border-b border-outline/20 p-2 flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('strike') ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    Strike
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    H3
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    Bullet List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-2 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
                >
                    Ordered List
                </button>
            </div>
            <EditorContent editor={editor} className="p-4 min-h-[200px] prose dark:prose-invert max-w-none focus:outline-none" />
        </div>
    );
}
