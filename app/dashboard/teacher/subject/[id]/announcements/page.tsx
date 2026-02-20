"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBullhorn, faPaperPlane, faPaperclip, faImage, 
  faTrash, faClock, faFilePdf, faTimes 
} from "@fortawesome/free-solid-svg-icons";


interface AttachedFile {
  name: string;
  type: "image" | "pdf";
  url: string;
}

interface Announcement {
  id: number;
  text: string;
  date: string;
  file?: AttachedFile | null;
}

export default function TeacherAnnouncements() {
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: 1, 
      text: "Please find the attached syllabus for the Microwave Engineering lab. We will begin experiments next week.", 
      date: "2 days ago",
      file: { name: "Lab_Syllabus.pdf", type: "pdf", url: "#" }
    }
  ]);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const newFile: AttachedFile = {
        name: file.name,
        type: isImage ? "image" : "pdf",
        url: URL.createObjectURL(file) 
      };
      setAttachedFile(newFile);
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachedFile) return;
    
    const newAnnouncement: Announcement = {
      id: Date.now(),
      text: message,
      date: "Just now",
      file: attachedFile
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setMessage("");
    setAttachedFile(null);
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Broadcast: {id}</h1>
        <p className="text-gray-500 font-medium mt-1">Send updates and documents to all students in this course.</p>
      </header>

     
      <form onSubmit={handlePost} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's the update for today?"
          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-900 min-h-[120px] transition-all"
        />

       
        {attachedFile && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-2xl w-fit">
            <FontAwesomeIcon icon={attachedFile.type === "image" ? faImage : faFilePdf} className="text-blue-900" />
            <span className="text-xs font-bold text-blue-900 truncate max-w-[200px]">{attachedFile.name}</span>
            <button 
              type="button"
              onClick={() => setAttachedFile(null)}
              className="w-6 h-6 bg-blue-200 text-blue-900 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="xs" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-900 transition-all flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPaperclip} />
            </button>
          </div>
          <button type="submit" className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center gap-2">
            <FontAwesomeIcon icon={faPaperPlane} /> 
            Post Announcement
          </button>
        </div>
      </form>

      
      <div className="space-y-6">
        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] ml-4">Sent History</h3>
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 font-medium leading-relaxed mb-4">{ann.text}</p>
                  <button 
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="text-gray-200 hover:text-red-500 transition-colors p-2"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                
                {ann.file && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-flex items-center gap-3">
                    <FontAwesomeIcon icon={ann.file.type === "image" ? faImage : faFilePdf} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">{ann.file.name}</span>
                    <a 
                      href={ann.file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 text-[10px] font-black uppercase text-blue-900 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                )}

                <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-2 mt-6">
                  <FontAwesomeIcon icon={faClock} /> {ann.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}