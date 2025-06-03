
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

const BUCKET_NAME = 'logos';

const UploadLogoForm = () => {
  const { user, profile, setProfile } = useSupabaseAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validação mais rigorosa do tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP).');
        return;
      }
      
      // Verificação do tamanho (2MB limite)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 2MB.');
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
      toast.warning('Selecione um arquivo para fazer upload.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      // Usar o ID do usuário como pasta para organizar os arquivos conforme esperado pelas políticas RLS
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log('Iniciando upload para:', fileName);
      console.log('Usuário ID:', user.id);
      console.log('Bucket:', BUCKET_NAME);

      // Primeiro, tentar remover arquivos antigos (se existirem)
      try {
        const { data: existingFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(user.id);

        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles
            .filter(file => file.name.startsWith('avatar.'))
            .map(file => `${user.id}/${file.name}`);
          
          if (filesToRemove.length > 0) {
            console.log('Removendo arquivos antigos:', filesToRemove);
            await supabase.storage
              .from(BUCKET_NAME)
              .remove(filesToRemove);
          }
        }
      } catch (listError) {
        console.log('Erro ao listar/remover arquivos antigos (não crítico):', listError);
        // Não bloquear o upload se não conseguir remover arquivos antigos
      }

      // Upload do novo arquivo
      console.log('Fazendo upload do arquivo...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, selectedFile, { 
          cacheControl: '3600', 
          upsert: true // Sobrescrever se existir
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Falha no upload: ${uploadError.message}`);
      }

      console.log('Upload realizado com sucesso:', uploadData);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Falha ao obter URL pública da imagem.');
      }
      
      const publicUrl = urlData.publicUrl;
      console.log('URL pública obtida:', publicUrl);

      // Atualizar perfil na tabela
      const { error: updateError } = await supabase
        .from('perfis')
        .update({ 
          logo_url: publicUrl, 
          data_atualizacao: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        throw new Error(`Falha ao atualizar perfil: ${updateError.message}`);
      }

      // Atualizar estado local
      if (setProfile) {
        setProfile({ ...profile, logo_url: publicUrl });
      }
      
      // Limpar estado
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Logo/Foto atualizada com sucesso!');

    } catch (error: any) {
      console.error('Erro durante upload:', error);
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
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-juriscalc-gold file:text-juriscalc-navy hover:file:bg-opacity-90"
            />
            <p className="text-xs text-muted-foreground">Tamanho máximo: 2MB. Formatos: JPG, PNG, GIF, WebP.</p>
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
