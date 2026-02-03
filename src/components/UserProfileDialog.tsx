import { useState, useEffect } from "react";
import { User, Upload, Mail, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfileStore } from "@/store/userProfileStore";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface UserProfileDialogProps {
  user: SupabaseUser | null;
  onLogout?: () => void;
}

export default function UserProfileDialog({
  user,
  onLogout,
}: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
  });
  const { profile, loadProfile, updateProfile, uploadAvatar } =
    useUserProfileStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      loadProfile(user.id);
    }
  }, [user, isOpen, loadProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.full_name,
        bio: formData.bio,
      });

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    const file = e.target.files[0];

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Imagem deve ter menos de 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(user.id, file);
      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout?.();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Usuário";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm text-slate-700 max-w-[120px] truncate">
            {displayName}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Perfil do Usuário</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite suas informações pessoais"
              : "Visualize e gerencie seu perfil"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            {isEditing && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                  id="avatar-input"
                />
                <label
                  htmlFor="avatar-input"
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Trocar foto
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    placeholder="Seu nome completo"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Fale um pouco sobre você..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">
                      Nome Completo
                    </p>
                    <p className="text-slate-900 mt-1">
                      {profile?.full_name || "—"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-sm text-slate-600 font-medium">Email</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-slate-600" />
                      <p className="text-slate-900">{user.email}</p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-sm text-slate-600 font-medium">Bio</p>
                      <p className="text-slate-900 mt-1 whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-200 hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
