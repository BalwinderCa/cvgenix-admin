"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

const ViewSupportModal = ({ isOpen, onClose, support, onMarkAsRead }) => {
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  const handleMarkAsRead = async () => {
    if (!support || support.status !== 'new') return;
    
    try {
      setIsMarkingAsRead(true);
      if (onMarkAsRead) {
        await onMarkAsRead(support);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  useEffect(() => {
    // Mark as read when modal opens if status is 'new'
    if (isOpen && support && support.status === 'new' && onMarkAsRead) {
      handleMarkAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!support) return null;

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-primary-500 text-white",
      read: "bg-info-500 text-white",
      replied: "bg-warning-500 text-white",
      resolved: "bg-success-500 text-white",
    };
    return colors[status] || "bg-slate-500 text-white";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <Modal
      activeModal={isOpen}
      onClose={onClose}
      title="Support Message Details"
      className="max-w-3xl"
      footerContent={
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Button
            text="Close"
            className="btn-secondary"
            onClick={onClose}
          />
          {support.status === 'new' && (
            <Button
              text={isMarkingAsRead ? "Marking as Read..." : "Mark as Read"}
              className="btn-primary"
              onClick={handleMarkAsRead}
              disabled={isMarkingAsRead}
            />
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-300">
                {support.subject}
              </h3>
              <Badge
                className={`${getStatusColor(support.status)} capitalize`}
                label={support.status}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Received: {formatDate(support.createdAt)}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Name
            </label>
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:user" className="w-5 h-5 text-slate-400" />
              <p className="text-sm text-slate-900 dark:text-slate-300 font-medium">
                {support.name}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email
            </label>
            <div className="flex items-center space-x-2">
              <Icon icon="heroicons:envelope" className="w-5 h-5 text-slate-400" />
              <a
                href={`mailto:${support.email}`}
                className="text-sm text-primary-500 dark:text-primary-400 hover:underline font-medium"
              >
                {support.email}
              </a>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Message
          </label>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {support.message}
            </p>
          </div>
        </div>

        {/* Admin Notes */}
        {support.adminNotes && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Admin Notes
            </label>
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-lg p-4 border border-warning-200 dark:border-warning-800">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {support.adminNotes}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-semibold">Created:</span> {formatDate(support.createdAt)}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span> {formatDate(support.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSupportModal;

