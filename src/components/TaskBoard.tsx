import React, { useState } from 'react';
import { Plus, Check, Trash2, Clock, Calendar, Notebook } from 'lucide-react';
import { UserNote } from '../types';

interface TaskBoardProps {
  notes: UserNote[];
  onAdd: (title: string, deadline?: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ notes, onAdd, onToggle, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle, newDeadline || undefined);
    setNewTitle('');
    setNewDeadline('');
    setIsAdding(false);
  };

  const pending = notes.filter(n => !n.completed);
  const completed = notes.filter(n => n.completed);

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100">
             <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4dd/512.gif" alt="Memo" className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kế hoạch</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Quản lý hiệu suất hàng ngày</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg shadow-red-200 active:scale-95 transition-all ring-4 ring-red-50"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Thêm nhiệm vụ</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nội dung</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Gặp khách hàng, nộp báo cáo..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Hạn chót</label>
                <input 
                  type="datetime-local" 
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 focus:bg-white outline-none"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 uppercase tracking-tighter"
                >
                  Bỏ qua
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-md shadow-red-100"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {pending.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              Đang thực hiện
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-black">{pending.length}</span>
            </h3>
            <div className="space-y-3">
              {pending.map(note => (
                <div key={note.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start space-x-4 transition-all hover:bg-slate-50">
                   <button 
                    onClick={() => onToggle(note.id)}
                    className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-100 flex items-center justify-center transition-all hover:border-red-500 group"
                   >
                     <div className="w-3 h-3 rounded-sm bg-transparent group-hover:bg-red-100" />
                   </button>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-800 break-words leading-tight">{note.title}</p>
                     {note.deadline && (
                       <div className="flex items-center text-[10px] text-rose-500 mt-1 font-bold">
                         <div className="w-1 h-1 bg-rose-500 rounded-full mr-1.5" />
                         <span>{new Date(note.deadline).toLocaleString('vi-VN')}</span>
                       </div>
                     )}
                   </div>
                   <button onClick={() => onDelete(note.id)} className="text-slate-200 hover:text-rose-600 p-1 transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đã xong</h3>
            <div className="space-y-2">
              {completed.map(note => (
                <div key={note.id} className="bg-slate-100/50 p-4 rounded-2xl flex items-center space-x-4 opacity-70">
                   <button 
                    onClick={() => onToggle(note.id)}
                    className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white"
                   >
                     <Check size={12} strokeWidth={4} />
                   </button>
                   <p className="flex-1 text-sm text-slate-500 line-through truncate font-medium">{note.title}</p>
                   <button onClick={() => onDelete(note.id)} className="text-slate-300 p-1">
                     <Trash2 size={14} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="text-center py-20 px-8">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm overflow-hidden">
               <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" alt="Party" className="w-12 h-12" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Chưa có nhiệm vụ nào được thiết lập.</p>
          </div>
        )}
      </div>
    </div>
  );
};
