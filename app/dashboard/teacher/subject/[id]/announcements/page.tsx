"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faPaperPlane, faPaperclip, faImage, faTrash, faClock } from "@fortawesome/free-solid-svg-icons";

export default function TeacherAnnouncements() {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: "The midterm will cover chapters 1 through 4. Good luck!", date: "2 days ago" },
    { id: 2, text: "Lab session for Group 2 is moved to Lab C.", date: "5 days ago" }
  ]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const newAnn = {
      id: Date.now(),
      text: message,
      date: "Just now"
    };
    setAnnouncements([newAnn, ...announcements]);
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 uppercase">Broadcast: {id}</h1>
        <p className="text-gray-500">Send an announcement to all students registered in this course.</p>
      </header>

      {/* Post Editor */}
      <form onSubmit={handlePost} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message to the students..."
          className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-2 focus:ring-blue-900 min-h-[150px] transition-all"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button type="button" className="w-10 h-10 rounded-full text-gray-400 hover:bg-gray-100 transition"><FontAwesomeIcon icon={faPaperclip} /></button>
            <button type="button" className="w-10 h-10 rounded-full text-gray-400 hover:bg-gray-100 transition"><FontAwesomeIcon icon={faImage} /></button>
          </div>
          <button type="submit" className="bg-blue-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center gap-2">
            <FontAwesomeIcon icon={faPaperPlane} /> Post Announcement
          </button>
        </div>
      </form>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest ml-4">Recently Sent</h3>
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-6 rounded-3xl border border-gray-50 flex justify-between items-start group">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faBullhorn} />
              </div>
              <div>
                <p className="text-gray-800 font-medium leading-relaxed">{ann.text}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} /> {ann.date}
                </p>
              </div>
            </div>
            <button className="text-gray-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-2">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}