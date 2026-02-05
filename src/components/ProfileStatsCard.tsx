import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  useUserProfile,
  useProfileDisplayName,
  useProfileInitials,
  useProfileCompletion,
} from "@/hooks/useUserProfile";

interface ProfileStatsCardProps {
  user: SupabaseUser | null;
  onEditClick?: () => void;
}

export default function ProfileStatsCard({
  user,
  onEditClick,
}: ProfileStatsCardProps) {
  const { profile, isLoading } = useUserProfile(user);
  const displayName = useProfileDisplayName(user);
  const initials = useProfileInitials(user);
  const completion = useProfileCompletion(user);

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionLabel = (percentage: number) => {
    if (percentage === 100) return "Completo";
    if (percentage >= 80) return "Quase lá!";
    if (percentage >= 50) return "Parcial";
    return "Incompleto";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md">
            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
            <AvatarFallback className="text-xl bg-emerald-100">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <CardTitle className="text-xl">{displayName}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {user.email}
            </CardDescription>

            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={completion === 100 ? "default" : "secondary"}
                className={completion === 100 ? "bg-green-600" : ""}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {getCompletionLabel(completion)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Profile Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Perfil Completo</span>
            <span className={`font-semibold ${getCompletionColor(completion)}`}>
              {completion}%
            </span>
          </div>
          <Progress value={completion} className="h-2" />
          {completion < 100 && (
            <p className="text-xs text-slate-500">
              Complete seu perfil para ter uma melhor experiência!
            </p>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Membro desde</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.created_at ? formatDate(profile.created_at) : "—"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Última atualização</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile?.updated_at ? formatDate(profile.updated_at) : "—"}
            </p>
          </div>
        </div>

        {/* Bio Preview */}
        {profile?.bio && (
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600 line-clamp-2">{profile.bio}</p>
          </div>
        )}

        {/* Quick Info */}
        {(profile?.location || profile?.phone || profile?.website) && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Informações Rápidas
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.location && (
                <Badge variant="outline" className="text-xs">
                  📍 {profile.location}
                </Badge>
              )}
              {profile.phone && (
                <Badge variant="outline" className="text-xs">
                  📱 Telefone
                </Badge>
              )}
              {profile.website && (
                <Badge variant="outline" className="text-xs">
                  🌐 Website
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Edit Button */}
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="w-full mt-4 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Editar Perfil
          </button>
        )}
      </CardContent>
    </Card>
  );
}
