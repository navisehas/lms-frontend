"use client";
import { useState } from 'react';
import { X, ZoomIn, Camera } from 'lucide-react';

export default function Gallery() {
  
  // 1. MOCK DATA - Replace 'src' with your actual image paths later
  const galleryItems = [
    {
      id: 1,
      category: "Classrooms",
      src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
      caption: "Main Lecture Hall A - Fully Air Conditioned"
    },
    {
      id: 2,
      category: "Events",
      src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      caption: "Annual Prize Giving Ceremony 2025"
    },
    {
      id: 3,
      category: "Classrooms",
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      caption: "Interactive Smart Board Sessions"
    },
    {
      id: 4,
      category: "Students",
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      caption: "Group Study Area"
    },
    {
      id: 5,
      category: "Events",
      src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80",
      caption: "Sinhala & Tamil New Year Celebration"
    },
    {
      id: 6,
      category: "Facilities",
      src: "https://images.unsplash.com/photo-1590402494587-44b71d8798b5?w=800&q=80",
      caption: "Modern Computer Lab"
    },
    {
      id: 7,
      category: "Awards",
      src: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
      caption: "District 1st Place - A/L Physics"
    },
    {
      id: 8,
      category: "Students",
      src: "https://images.unsplash.com/photo-1427504743055-e99aa7616bd3?w=800&q=80",
      caption: "Outdoor Study Park"
    }
  ];

  // 2. STATE
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null); // For the Lightbox Modal

  // 3. FILTER LOGIC
  const categories = ["All", "Classrooms", "Events", "Students", "Facilities", "Awards"];
  
  const filteredItems = filter === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-gray-900 text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Life at Institute</h1>
        <p className="text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          Capturing moments of learning, success, and celebration.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* TABS / FILTERS */}
        <div className="bg-white p-2 rounded-xl shadow-md mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max justify-center md:justify-center p-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filter === cat 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-64 bg-gray-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              {/* Image */}
              <img 
                src={item.src} 
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                  {item.category}
                </span>
                <p className="text-white font-medium text-sm leading-tight">
                  {item.caption}
                </p>
                <div className="absolute top-4 right-4 text-white">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No images found in this category.
          </div>
        )}

      </div>

      {/* LIGHTBOX MODAL (Pop-up) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition"
          >
            <X className="w-10 h-10" />
          </button>

          {/* Modal Content */}
          <div className="max-w-5xl w-full max-h-screen flex flex-col items-center">
            <div className="relative w-full aspect-video md:h-[80vh]">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.caption} 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 text-center">
              <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">
                {selectedImage.category}
              </span>
              <p className="text-white text-lg mt-1">{selectedImage.caption}</p>
            </div>
          </div>
          
        </div>
      )}

    </div>
  );
}