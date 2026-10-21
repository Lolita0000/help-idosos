// Ações de Editar/Excluir dos cards de entrada, compartilhadas por Dashboard e Diário.
import { router } from 'expo-router';
import { useState } from 'react';

import { api, messageOf, type DiaryEntry, type Role } from '../core';
import { useSession } from '../session';
import { Dialog } from './ui';

export function useEntryActions(workspaceId: string, role: Role | undefined, onChanged: () => void) {
  const { token, user, handleAuthError } = useSession();
  const [toDelete, setToDelete] = useState<DiaryEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const permissions = (e: DiaryEntry) => {
    const mine = e.authorId === user?.id;
    return { canEdit: mine, canDelete: mine || role === 'admin' };
  };

  const edit = (e: DiaryEntry) =>
    router.push({ pathname: '/workspace/[id]/diario/entrada', params: { id: workspaceId, entryId: e.id } });

  async function confirmDelete() {
    if (!token || !toDelete) return;
    const entry = toDelete;
    setDeleting(true);
    try {
      await api.deleteEntry(token, entry.id);
      setNotice(`Entrada “${entry.title}” excluída.`);
      setFailure(null);
      onChanged();
    } catch (e) {
      if (!handleAuthError(e)) setFailure(messageOf(e));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const dialog = (
    <Dialog
      visible={!!toDelete}
      icon="trash-2"
      danger
      title="Excluir entrada?"
      message={`“${toDelete?.title ?? ''}” será removida em definitivo e não poderá ser recuperada.`}
      confirm={deleting ? 'Excluindo...' : 'Excluir'}
      onCancel={() => setToDelete(null)}
      onConfirm={confirmDelete}
    />
  );

  return { permissions, edit, requestDelete: setToDelete, dialog, notice, failure };
}
