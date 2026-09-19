import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  className={`p-3.5 text-left hover:bg-slate-50 transition-colors flex items-start space-x-3 cursor-pointer ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      !n.read ? 'bg-indigo-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center space-x-0.5"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
