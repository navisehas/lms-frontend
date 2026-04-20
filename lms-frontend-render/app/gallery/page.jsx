"use client";
import { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  Camera, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  Download,
  Calendar,
  Users,
  Award,
  BookOpen,
  Building2
} from 'lucide-react';

export default function Gallery() {
  
  // 1. MOCK DATA
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 3. CATEGORIES with icons
  const categories = [
    { name: "All", icon: ImageIcon },
    { name: "Classrooms", icon: BookOpen },
    { name: "Events", icon: Calendar },
    { name: "Students", icon: Users },
    { name: "Facilities", icon: Building2 },
    { name: "Awards", icon: Award }
  ];
  
  const filteredItems = filter === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  // 4. LIGHTBOX NAVIGATION
  const openLightbox = (item, index) => {
    setSelectedImage(item);
    setSelectedIndex(index);
  };

  const closeLightbox = () => setSelectedImage(null);

  const goToPrev = (e) => {
    e?.stopPropagation();
    const newIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedIndex(newIndex);
    setSelectedImage(filteredItems[newIndex]);
  };

  const goToNext = (e) => {
    e?.stopPropagation();
    const newIndex = (selectedIndex + 1) % filteredItems.length;
    setSelectedIndex(newIndex);
    setSelectedImage(filteredItems[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedImage, selectedIndex, filteredItems]);

  // Category color mapping
  const getCategoryColor = (cat) => {
    const colors = {
      Classrooms: "from-blue-500 to-blue-700",
      Events: "from-cyan-500 to-blue-600",
      Students: "from-blue-600 to-cyan-500",
      Facilities: "from-blue-700 to-blue-900",
      Awards: "from-yellow-500 to-orange-500"
    };
    return colors[cat] || "from-blue-600 to-cyan-500";
  };

  return (
    <main className="flex flex-col min-h-screen relative overflow-x-hidden bg-gray-50">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION - Gradient with glow orbs
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Animated Glow Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Geometric shapes */}
        <div className="absolute top-16 right-16 w-20 h-20 border-2 border-blue-300/30 rounded-lg rotate-12 animate-pulse"></div>
        <div className="absolute bottom-24 left-16 w-16 h-16 border-2 border-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-28 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 rounded-full px-4 py-1.5 mb-6">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wide">Our Gallery</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Life at
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-white">
                Our Institute
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Capturing moments of learning, success, and celebration that define our community.
            </p>

            {/* Mini stats chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { icon: ImageIcon, text: `${galleryItems.length}+ Photos` },
                { icon: Calendar, text: "Regular Updates" },
                { icon: Sparkles, text: "Memorable Moments" }
              ].map((chip, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <chip.icon className="w-4 h-4 text-cyan-300" />
                  {chip.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. FILTER TABS + GRID
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 w-full">
        
        {/* Filter Tabs - Floating gradient border card */}
        <div className="relative p-[1px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-2xl shadow-2xl mb-8">
          <div className="bg-white rounded-2xl p-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max justify-start md:justify-center">
              {categories.map((cat) => {
                const isActive = filter === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setFilter(cat.name)}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <cat.icon className={`w-4 h-4 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                    {cat.name}
                    {isActive && (
                      <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {filteredItems.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results count */}
        {filteredItems.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Showing <span className="font-extrabold text-gray-900">{filteredItems.length}</span> {filteredItems.length === 1 ? "photo" : "photos"}
              {filter !== "All" && <span> in <span className="font-extrabold text-blue-600">{filter}</span></span>}
            </p>
          </div>
        )}

        {/* IMAGE GRID */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id}
                onClick={() => openLightbox(item, index)}
                className="group relative h-72 bg-gray-200 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image */}
                <img 
                  src={item.src} 
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Category badge - always visible */}
                <div className="absolute top-3 left-3 z-10">
                  <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${getCategoryColor(item.category)} text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
                    {item.category}
                  </span>
                </div>

                {/* Zoom icon - always visible top-right */}
                <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                </div>
                
                {/* Bottom gradient overlay with caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-5 px-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white font-bold text-sm leading-tight mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    {item.caption}
                  </p>
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                    <ZoomIn className="w-3 h-3" />
                    <span>Click to view</span>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 w-0 group-hover:w-full z-20"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
              <Camera size={36} className="text-blue-600" />
            </div>
            <p className="text-xl font-extrabold text-gray-900 mb-2">No images found</p>
            <p className="text-sm text-gray-500 mb-5">No photos in the "{filter}" category yet</p>
            <button
              onClick={() => setFilter("All")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              View All Photos
            </button>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. LIGHTBOX MODAL - Enhanced with navigation
          ═══════════════════════════════════════════════════════════ */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          
          {/* Close Button */}
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] w-12 h-12 bg-white/10 hover:bg-red-500 border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-[110] bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-full">
            {selectedIndex + 1} / {filteredItems.length}
          </div>

          {/* Prev Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {filteredItems.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Modal Content */}
          <div 
            className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image with gradient border */}
            <div className="relative w-full flex-1 flex items-center justify-center mb-4">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.caption} 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>

            {/* Caption card */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center">
              <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${getCategoryColor(selectedImage.category)} text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2`}>
                {selectedImage.category}
              </span>
              <p className="text-white text-base md:text-lg font-bold">{selectedImage.caption}</p>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
