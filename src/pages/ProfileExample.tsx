/**
 * Example page demonstrating the enhanced user profile system
 * This file shows how to use all the new profile features
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import UserProfileDialog from "@/components/UserProfileDialog";
import ProfileStatsCard from "@/components/ProfileStatsCard";
import {
  useUserProfile,
  useProfileDisplayName,
  useProfileCompletion,
  useProfileComplete,
} from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ProfileExamplePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Use profile hooks
  const { profile, isLoading, refresh } = useUserProfile(user);
  const displayName = useProfileDisplayName(user);
  const completion = useProfileCompletion(user);
  const isComplete = useProfileComplete(user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">
            Você precisa estar logado para ver esta página
          </p>
          <Button onClick={() => navigate("/auth")}>Fazer Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Olá, {displayName}! 👋
            </h1>
            <p className="text-slate-600 mt-1">
              Gerencie seu perfil e configurações
            </p>
          </div>

          <UserProfileDialog user={user} onLogout={handleLogout} />
        </div>

        {/* Profile Completion Banner */}
        {!isComplete && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-900">
                  Complete seu perfil
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Adicione mais informações para ter uma melhor experiência
                </p>
              </div>
              <Button
                onClick={() => setProfileDialogOpen(true)}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Completar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Stats Card */}
          <div className="lg:col-span-1">
            <ProfileStatsCard
              user={user}
              onEditClick={() => setProfileDialogOpen(true)}
            />
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Completion Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Progresso do Perfil
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">
                      Completude do Perfil
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {completion}%
                    </span>
                  </div>
                  <Progress value={completion} className="h-3" />
                </div>

                {/* Field Checklist */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { label: "Nome", value: !!profile?.full_name },
                    { label: "Bio", value: !!profile?.bio },
                    { label: "Avatar", value: !!profile?.avatar_url },
                    { label: "Localização", value: !!profile?.location },
                    { label: "Telefone", value: !!profile?.phone },
                    { label: "Website", value: !!profile?.website },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      {field.value ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                      <span
                        className={
                          field.value ? "text-slate-900" : "text-slate-400"
                        }
                      >
                        {field.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Suas Informações
              </h3>

              {isLoading ? (
                <p className="text-slate-500">Carregando...</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Nome</p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile?.full_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Localização</p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile?.location || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Telefone</p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile?.phone || "—"}
                      </p>
                    </div>
                  </div>

                  {profile?.bio && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Bio</p>
                      <p className="text-sm text-slate-700">{profile.bio}</p>
                    </div>
                  )}

                  <Button
                    onClick={refresh}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Atualizar Dados
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Ações Rápidas
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setProfileDialogOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sair da Conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
