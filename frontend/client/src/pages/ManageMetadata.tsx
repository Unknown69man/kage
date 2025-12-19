import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Plus, Trash2, Edit2, Tag, Folder, Clapperboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ManageMetadata() {
  const [tags, setTags] = useState(["Cyberpunk", "Sci-Fi", "Classic", "Nature", "Documentary"]);
  const [categories, setCategories] = useState(["Movies", "Collections", "References", "Documentaries"]);
  const [genres, setGenres] = useState(["Sci-Fi", "Nature", "Architecture", "Technology", "Abstract"]);
  const [cast, setCast] = useState(["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Zoe Kravitz", "Mark Ruffalo"]);
  const [newItem, setNewItem] = useState("");

  const handleAddTag = () => {
    if (newItem && !tags.includes(newItem)) {
      setTags([...tags, newItem]);
      setNewItem("");
    }
  };

  const handleAddCategory = () => {
    if (newItem && !categories.includes(newItem)) {
      setCategories([...categories, newItem]);
      setNewItem("");
    }
  };

  const handleAddGenre = () => {
    if (newItem && !genres.includes(newItem)) {
      setGenres([...genres, newItem]);
      setNewItem("");
    }
  };

  const handleRemoveTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const handleRemoveCategory = (cat: string) => setCategories(categories.filter((c) => c !== cat));
  const handleRemoveGenre = (gen: string) => setGenres(genres.filter((g) => g !== gen));
  const handleRemoveCast = (actor: string) => setCast(cast.filter((c) => c !== actor));

  const handleAddCast = () => {
    if (newItem && !cast.includes(newItem)) {
      setCast([...cast, newItem]);
      setNewItem("");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Metadata Management</h1>
          <p className="text-muted-foreground">Create, update, and manage tags, categories, and genres.</p>
        </div>

        <Tabs defaultValue="tags" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border/50 p-1 h-auto">
            <TabsTrigger value="tags" className="gap-2 data-[state=active]:bg-cyan-600/20">
              <Tag className="w-4 h-4" /> Tags
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-cyan-600/20">
              <Folder className="w-4 h-4" /> Categories
            </TabsTrigger>
            <TabsTrigger value="genres" className="gap-2 data-[state=active]:bg-cyan-600/20">
              <Clapperboard className="w-4 h-4" /> Genres
            </TabsTrigger>
            <TabsTrigger value="cast" className="gap-2 data-[state=active]:bg-cyan-600/20">
              <Users className="w-4 h-4" /> Cast
            </TabsTrigger>
          </TabsList>

          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border/50 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new tag..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button
                  onClick={handleAddTag}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Tag
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Existing Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20 transition-colors cursor-pointer flex items-center gap-2 group"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border/50 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button
                  onClick={handleAddCategory}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Existing Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-2 group"
                    >
                      {cat}
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Genres Tab */}
          <TabsContent value="genres" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border/50 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new genre..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddGenre()}
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button
                  onClick={handleAddGenre}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Genre
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Existing Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((gen) => (
                    <Badge
                      key={gen}
                      variant="outline"
                      className="px-3 py-1.5 bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer flex items-center gap-2 group"
                    >
                      {gen}
                      <button
                        onClick={() => handleRemoveGenre(gen)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Cast Tab */}
          <TabsContent value="cast" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border/50 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add cast member..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCast()}
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button
                  onClick={handleAddCast}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Cast
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Cast Members</h3>
                <div className="flex flex-wrap gap-2">
                  {cast.map((actor) => (
                    <Badge
                      key={actor}
                      variant="outline"
                      className="px-3 py-1.5 bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20 transition-colors cursor-pointer flex items-center gap-2 group"
                    >
                      {actor}
                      <button
                        onClick={() => handleRemoveCast(actor)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
