import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MediaCard } from "@/components/library/MediaCard";
import { DetailModal } from "@/components/library/DetailModal";
import { Pagination } from "@/components/library/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { MOCK_LIBRARY, MediaItem } from "@/lib/mockData";

export default function Library() {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [, navigate] = useLocation();

  const pagination = usePagination(MOCK_LIBRARY, 20);

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handlePlay = (item: MediaItem) => {
    // Navigate to video player if it's a video with a URL
    if (item.type === "video" && item.videoUrl) {
      navigate(`/video/${item.id}`);
    } else if (item.type === "video") {
      navigate(`/video/${item.id}`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Library</h1>
          <p className="text-muted-foreground">Manage and view your media collection. {MOCK_LIBRARY.length} items total.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 auto-rows-max">
          {pagination.currentItems.map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              onSelect={() => handleSelect(item)}
              onPlay={() => handlePlay(item)}
            />
          ))}
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      </div>

      <DetailModal 
        item={selectedItem} 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </AppLayout>
  );
}
