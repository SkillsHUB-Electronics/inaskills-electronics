"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { uploadImage } from "@/lib/mutations";
import { toHtml } from "@/lib/richtext";

// Editor teks kaya untuk isi berita. Disimpan sebagai HTML; hanya dimuat di panel admin.
export default function RichTextEditor({ value, onChange, bucket }: { value: string; onChange: (html: string) => void; bucket: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        codeBlock: false,
        code: false,
      }),
      Image,
    ],
    // Isi lama berupa teks biasa: ubah tiap paragraf (baris kosong) jadi <p>.
    content: toHtml(value),
    editorProps: { attributes: { class: "rich-content min-h-[14rem] px-3 py-3 focus:outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      {editor && <Toolbar editor={editor} bucket={bucket} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, bucket }: { editor: Editor; bucket: string }) {
  const [uploading, setUploading] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = prompt("Alamat link (kosongkan untuk menghapus link):", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function addImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadImage(bucket, file);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } catch (err) {
      alert(`Upload gambar gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  const c = () => editor.chain().focus();
  const buttons: { label: React.ReactNode; title: string; active?: boolean; run: () => void }[] = [
    { label: <b>B</b>, title: "Tebal", active: state.bold, run: () => c().toggleBold().run() },
    { label: <i>I</i>, title: "Miring", active: state.italic, run: () => c().toggleItalic().run() },
    { label: <u>U</u>, title: "Garis bawah", active: state.underline, run: () => c().toggleUnderline().run() },
    { label: "H2", title: "Subjudul", active: state.h2, run: () => c().toggleHeading({ level: 2 }).run() },
    { label: "H3", title: "Subjudul kecil", active: state.h3, run: () => c().toggleHeading({ level: 3 }).run() },
    { label: "• Daftar", title: "Daftar berpoin", active: state.bullet, run: () => c().toggleBulletList().run() },
    { label: "1. Daftar", title: "Daftar bernomor", active: state.ordered, run: () => c().toggleOrderedList().run() },
    { label: "❝", title: "Kutipan", active: state.quote, run: () => c().toggleBlockquote().run() },
    { label: "🔗 Link", title: "Tambah/ubah link", active: state.link, run: setLink },
    { label: "↶", title: "Urungkan", run: () => c().undo().run() },
    { label: "↷", title: "Ulangi", run: () => c().redo().run() },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
      {buttons.map((b) => (
        <button
          key={b.title}
          type="button"
          title={b.title}
          aria-label={b.title}
          aria-pressed={b.active}
          // Cegah editor kehilangan fokus saat tombol ditekan.
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.run}
          className={`min-w-8 rounded px-2 py-1 text-sm ${b.active ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-200"}`}
        >
          {b.label}
        </button>
      ))}
      <label title="Sisipkan gambar" className="cursor-pointer rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-200">
        {uploading ? "Mengunggah..." : "🖼 Gambar"}
        <input type="file" accept="image/*" onChange={addImage} disabled={uploading} className="hidden" />
      </label>
    </div>
  );
}
