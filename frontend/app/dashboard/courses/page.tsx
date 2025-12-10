"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/courses/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { courseApi, type Course } from "@/lib/api/courseApi";

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getAll();
      // Transform courses to include counts
      const coursesWithCounts = data.map((course) => ({
        ...course,
        learningOutcomesCount: course.learningOutcomes?.length || 0,
        studentsCount: course.students?.length || 0,
      }));
      setCourses(coursesWithCounts);
      setFilteredCourses(coursesWithCounts);
    } catch (error: any) {
      toast.error("Dersler yüklenemedi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        ((course as any).semester || "").toLowerCase().includes(query)
    );

    setFilteredCourses(filtered);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      setIsDeleting(true);
      await courseApi.remove(selectedCourse._id);
      toast.success("Ders başarıyla silindi");
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Ders silinirken bir hata oluştu"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Derslerim
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Oluşturduğunuz derslerin listesi
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/courses/create")}
            className="h-14 text-lg px-8 font-semibold"
          >
            <Plus className="h-6 w-6 mr-2" />
            Yeni Ders Oluştur
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
          <Input
            placeholder="Ders Ara…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 text-xl rounded-xl border-2 focus:border-primary"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-2xl font-semibold text-muted-foreground mb-6">
              {searchQuery
                ? "Arama kriterlerinize uygun ders bulunamadı"
                : "Henüz ders oluşturmadınız."}
            </p>
            {!searchQuery && (
              <Button
                size="lg"
                onClick={() => router.push("/dashboard/courses/create")}
                className="h-14 text-lg px-8 font-semibold"
              >
                <Plus className="h-6 w-6 mr-2" />
                Yeni Ders Oluştur
              </Button>
            )}
          </div>
        )}

        {/* Course Cards Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClose={handleDeleteCancel} className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                Dersi Sil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Bu işlemi geri alamazsınız. Ders ve tüm ilişkili sınav verileri
                silinecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedCourse && (
              <div className="my-4 p-4 bg-muted rounded-lg">
                <p className="text-lg font-semibold">{selectedCourse.name}</p>
                <p className="text-sm text-muted-foreground">
                  Kod: {selectedCourse.code}
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="h-12 text-base px-6"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="h-12 text-base px-6"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  "Sil"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Skeleton Component for Loading State
function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
  );
}
