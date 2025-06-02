import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { getInitials } from '@/utils/getInitials';

const BUCKET_NAME = 'logos'; // Assume the bucket is named 'logos'

const UploadLogoForm = () => {
  const { user, profile, setProfile } = useSupabaseAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional: add size limit, more types)
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione um ficheiro de imagem (PNG, JPG, GIF, etc.).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !profile) {
      toast.warning('Selecione um ficheiro para fazer upload.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`; // Path within the bucket

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, selectedFile, { 
            cacheControl: '3600', 
            upsert: true // Overwrite if file exists
        });

      if (uploadError) {
        console.error('Erro no upload para Supabase Storage:', uploadError);
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
          console.error('Não foi possível obter a URL pública após o upload.');
          // Tentar construir a URL manualmente como fallback (menos ideal)
          // const manualUrl = `${supabase.storage.url}/object/public/${BUCKET_NAME}/${filePath}`;
          // Se nem isso funcionar, lançar erro.
          throw new Error('Falha ao obter URL pública da imagem.');
      }
      
      const publicUrl = urlData.publicUrl;
      console.log('URL Pública obtida:', publicUrl);

      // 3. Update profile table
      const { error: updateError } = await supabase
        .from('perfis')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil no Supabase:', updateError);
        throw new Error(`Falha ao atualizar perfil: ${updateError.message}`);
      }

      // 4. Update local state
      setProfile({ ...profile, logo_url: publicUrl });
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }

      toast.success('Logo/Foto atualizada com sucesso!');

    } catch (error: any) {
      console.error('Erro durante o processo de upload:', error);
      toast.error(`Erro ao fazer upload: ${error.message || 'Tente novamente.'}`);
    } finally {
      setUploading(false);
    }
  };

  const currentLogoUrl = previewUrl || profile?.logo_url;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Logo/Foto do Perfil</CardTitle>
        <CardDescription>Faça upload ou altere sua imagem de perfil.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={currentLogoUrl || undefined} alt={profile?.nome_completo || user?.email} />
            <AvatarFallback className="bg-juriscalc-gold text-juriscalc-navy text-3xl">
              {getInitials(profile?.nome_completo || user?.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow w-full space-y-3">
          <div className="space-y-2">
            <label htmlFor="logo-upload" className="block text-sm font-medium">
              Selecionar nova imagem
            </label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-juriscalc-gold file:text-juriscalc-navy hover:file:bg-opacity-90"
            />
            <p className="text-xs text-muted-foreground">Tamanho máximo recomendado: 2MB. Formatos: JPG, PNG, GIF, WebP.</p>
          </div>
          {selectedFile && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading} 
              className="w-full sm:w-auto bg-juriscalc-navy text-white hover:bg-opacity-90"
            >
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Enviando...' : 'Enviar Nova Imagem'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadLogoForm;

