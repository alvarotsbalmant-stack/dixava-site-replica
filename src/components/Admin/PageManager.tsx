
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, LayoutList, FileText, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePageManager } from './PageManager/usePageManager';
import PageForm from './PageManager/PageForm';
import PageList from './PageManager/PageList';
import PageLayoutManager from './PageLayoutManager';

const PageManager: React.FC = () => {
  const {
    pages,
    loading,
    error,
    activeTab,
    selectedPage,
    isEditing,
    isLayoutOpen,
    formData,
    setActiveTab,
    setIsEditing,
    setIsLayoutOpen,
    handleInputChange,
    handleSwitchChange,
    handleCreatePage,
    handleUpdatePage,
    handleDeletePage,
    handleEditPage,
    handleOpenLayout
  } = usePageManager();

  return (
    <div className="space-y-6">
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardHeader className="border-b border-[#343A40]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Gerenciador de Páginas</CardTitle>
              <CardDescription className="text-gray-400">
                Crie e gerencie páginas personalizadas para categorias e plataformas específicas
              </CardDescription>
            </div>
            {activeTab === 'list' && !isEditing && (
              <Button onClick={() => setActiveTab('create')} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
                <Plus className="mr-2 h-4 w-4" />
                Nova Página
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Editar Página</h2>
              <PageForm
                formData={formData}
                onInputChange={handleInputChange}
                onSwitchChange={handleSwitchChange}
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'create')}>
              <TabsList className="grid w-full grid-cols-2 bg-[#343A40] border-[#6C757D]">
                <TabsTrigger value="list" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white text-gray-300 hover:text-white">
                  <FileText className="mr-2 h-4 w-4" /> Lista de Páginas
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-[#007BFF] data-[state=active]:text-white text-gray-300 hover:text-white">
                  <Plus className="mr-2 h-4 w-4" /> Criar Página
                </TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="mt-6">
                <PageList
                  pages={pages}
                  loading={loading}
                  error={error}
                  onCreatePage={() => setActiveTab('create')}
                  onEditPage={handleEditPage}
                  onDeletePage={handleDeletePage}
                  onOpenLayout={handleOpenLayout}
                />
              </TabsContent>
              <TabsContent value="create" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Nova Página</h2>
                  <PageForm
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSwitchChange={handleSwitchChange}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t border-[#343A40] bg-[#2C2C44] p-6">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white">
                Cancelar
              </Button>
              <Button onClick={handleUpdatePage} className="bg-[#28A745] hover:bg-[#218838] text-white">
                Salvar Alterações
              </Button>
            </>
          ) : activeTab === 'create' ? (
            <>
              <Button variant="outline" onClick={() => setActiveTab('list')} className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white">
                Cancelar
              </Button>
              <Button onClick={handleCreatePage} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
                Criar Página
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>

      {/* Layout Manager Dialog */}
      {selectedPage && (
        <Dialog open={isLayoutOpen} onOpenChange={setIsLayoutOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#2C2C44] border-[#343A40] text-white">
            <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
              <DialogTitle className="text-white text-2xl">Layout da Página: {selectedPage.title}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Organize as seções e configure o conteúdo da página
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <PageLayoutManager page={selectedPage} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PageManager;
