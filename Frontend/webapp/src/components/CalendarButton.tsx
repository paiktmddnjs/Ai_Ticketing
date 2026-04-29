'use client';

import React from 'react';
import * as ics from 'ics';
import { EventAttributes } from 'ics';

interface EventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
}

interface CalendarButtonProps {
  eventData: EventData;
  className?: string;
  children?: React.ReactNode;
}

export default function CalendarButton({ eventData, className, children }: CalendarButtonProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const start = eventData.startDate;
    if (isNaN(start.getTime())) {
      alert('유효하지 않은 날짜 정보입니다. 공연 일시를 확인해 주세요.');
      return;
    }

    const dateArray: [number, number, number, number, number] = [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ];

    const event: EventAttributes = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start: dateArray,
      duration: { minutes: eventData.durationMinutes },
      alarms: [
        { action: 'display', description: 'Reminder', trigger: { hours: 1, before: true } },
        { action: 'display', description: 'Reminder', trigger: { hours: 24, before: true } }
      ]
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        alert('캘린더 파일 생성 중 오류가 발생했습니다.');
        return;
      }

      try {
        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventData.title.replace(/[\\/:*?"<>|]/g, '')}_예매일정.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (downloadError) {
        alert('파일 다운로드에 실패했습니다.');
      }
    });
  };

  return (
    <button 
      onClick={handleDownload}
      className={className || "w-fit px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2 border border-indigo-100"}
      title="캘린더에 추가"
    >
      {children || <><i className="fas fa-calendar-plus"></i> 캘린더에 추가하기</>}
    </button>
  );
}
