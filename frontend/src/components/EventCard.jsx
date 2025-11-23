import React from 'react';

const EventCard = ({ event, onClick }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition flex overflow-hidden h-32 md:h-40">

      <div className="w-1/3 md:w-40 flex-shrink-0">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{event.title}</h3>
          <p className="text-gray-600 text-xs md:text-sm mt-1">
            <span className="font-semibold">Địa điểm:</span> {event.location}
          </p>
          <p className="text-gray-500 text-[10px] md:text-xs mt-1">
            Bắt đầu: {event.date}
          </p>
        </div>
      </div>

      <div className="w-24 md:w-32 flex items-center justify-center p-2 border-l border-gray-100">
        <button 
          onClick={() => onClick(event)}
          className="bg-green-700 hover:bg-green-800 text-white text-xs md:text-sm font-semibold py-2 px-4 rounded shadow transition"
        >
          Chi tiết
        </button>
      </div>
    </div>
  );
};

export default EventCard;