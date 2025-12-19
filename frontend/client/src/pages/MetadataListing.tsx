import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { MediaCard } from "@/components/library/MediaCard";
import { Pagination } from "@/components/library/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { MOCK_LIBRARY, MediaItem } from "@/lib/mockData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DetailModal } from "@/components/library/DetailModal";

export default function MetadataListing() {
  const params = useParams<{ type: string; value: string }>();
  const [, navigate] = useLocation();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const metadataType = params.type || "tag";
  const metadataValue = decodeURIComponent(params.value || "");

  const filteredItems = MOCK_LIBRARY.filter((item) => {
    if (item.type === "folder") return false;
    
    switch (metadataType) {
      case "tag":
        return item.tags?.includes(metadataValue) || false;
      case "genre":
        return item.genre?.includes(metadataValue) || false;
      case "category":
        return item.category === metadataValue;
      case "cast":
        // Cast filtering - check if any property contains cast info
        return JSON.stringify(item).toLowerCase().includes(metadataValue.toLowerCase());
      default:
        return false;
    }
  });

  const pagination = usePagination(filteredItems, 20);

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handlePlay = (item: MediaItem) => {
    if (item.type === "video" && item.videoUrl) {
      navigate(`/video/${item.id}`);
    }
  };

  const getLabel = () => {
    switch (metadataType) {
      case "tag":
        return `Tag: ${metadataValue}`;
      case "genre":
        return `Genre: ${metadataValue}`;
      case "category":
        return `Category: ${metadataValue}`;
      case "cast":
        return `Cast: ${metadataValue}`;
      default:
        return metadataValue;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-display mb-2">{getLabel()}</h1>
            <p className="text-muted-foreground">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found</p>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items found for this {metadataType}</p>
          </div>
        )}
      </div>

      <DetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </AppLayout>
  );
}
