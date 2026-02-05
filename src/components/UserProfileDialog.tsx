import { useState, useEffect } from "react";
import {
  User,
  Upload,
  Mail,
  LogOut,
  MapPin,
  Phone,
  AlertCircle,
  Camera,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfileStore } from "@/store/userProfileStore";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import {
  validateProfileForm,
  validateAvatar,
  formatPhone,
} from "@/lib/profileValidation";

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formData, setFormData] = useState({
    full_name: "",
    location: "",
    phone: "",
  });
  const {
    profile,
    loadProfile,
    updateProfile,
    uploadAvatar,
    clearError,
    error,
  } = useUserProfileStore();
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
        location: profile.location || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate form
    const validation = validateProfileForm(formData);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setValidationErrors({});
    setIsLoading(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.full_name,
        location: formData.location,
        phone: formData.phone,
      });

      // Voltar para modo de visualização
      setIsEditing(false);

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
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
    const validation = validateAvatar(file);
    if (!validation.isValid) {
      toast({
        title: "Erro",
        description: validation.errors.file || "Erro ao validar imagem",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

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
      setAvatarPreview(null);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm text-slate-700 max-w-[120px] truncate">
            {displayName}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[340px] max-h-[80vh] overflow-y-auto p-3"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-2.5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={avatarPreview || profile?.avatar_url || ""}
                  alt={displayName}
                />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

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
                  className="justify-center flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      Trocar foto
                    </>
                  )}
                </label>
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  JPG, PNG ou WebP • Máx 5MB
                </p>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-2">
            {isEditing ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-sm">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="Seu nome completo"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className={`h-9 text-sm ${
                      validationErrors.full_name ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.full_name && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.full_name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm">
                    Localização
                  </Label>
                  <LocationSearch
                    onLocationSelect={(location) => {
                      setFormData({ ...formData, location: location.name });
                    }}
                    initialLocation={
                      formData.location
                        ? {
                            lat: 0,
                            lng: 0,
                            name: formData.location,
                          }
                        : undefined
                    }
                  />
                  {validationErrors.location && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.location}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">
                    Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-3 h-3 text-slate-400" />
                    <Input
                      id="phone"
                      placeholder="(XX) XXXXX-XXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`pl-9 h-9 text-sm ${validationErrors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.phone}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-slate-50 p-2 space-y-1.5">
                  <div>
                    <p className="text-xs text-slate-600 font-medium">
                      Nome Completo
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {profile?.full_name || "—"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5">
                    <p className="text-xs text-slate-600 font-medium">Email</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-600" />
                      <p className="text-sm text-slate-900">{user.email}</p>
                    </div>
                  </div>

                  {profile?.location && (
                    <div className="border-t border-slate-200 pt-1.5">
                      <p className="text-xs text-slate-600 font-medium">
                        Localização
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        <p className="text-sm text-slate-900">
                          {profile.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile?.phone && (
                    <div className="border-t border-slate-200 pt-1.5">
                      <p className="text-xs text-slate-600 font-medium">
                        Telefone
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-600" />
                        <p className="text-sm text-slate-900">
                          {formatPhone(profile.phone)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
              >
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-200 hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
