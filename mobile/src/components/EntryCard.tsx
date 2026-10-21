// Card de entrada do diário (Figma: diario / dashboard — com o menu ⋮ de Editar e Excluir).
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import type { DiaryEntry } from '../core';
import { categoryOf, moodOf } from '../core/diary';
import { initials, relativeTime } from '../core/format';
import { colors, radius, TOUCH } from '../theme';
import { Avatar, Feather, T } from './ui';

export function CategoryBadge({ category }: { category: DiaryEntry['category'] }) {
  const c = categoryOf(category);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <T w="medium" size={12} color={c.fg}>
        {c.label}
      </T>
    </View>
  );
}

export function EntryCard({
  entry,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  entry: DiaryEntry;
  /** RN-008: só o autor edita. */
  canEdit: boolean;
  /** RN-007: autor ou administrador excluem. */
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const mood = moodOf(entry.mood);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Avatar text={initials(entry.authorName)} size={36} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <T w="medium" size={15} numberOfLines={2}>
            {entry.authorName}
          </T>
          <T size={12} color={colors.textMuted}>
            {relativeTime(entry.createdAt)}
            {entry.updatedAt ? ' · editado' : ''}
          </T>
        </View>
        <CategoryBadge category={entry.category} />
        {canEdit || canDelete ? (
          <ActionMenu title={entry.title} canEdit={canEdit} canDelete={canDelete} onEdit={onEdit} onDelete={onDelete} />
        ) : (
          <View style={{ width: 8 }} />
        )}
      </View>
      <T w="medium" size={16} style={{ marginTop: 12 }}>
        {entry.title}
      </T>
      <T size={15} color="#4B5563" style={{ marginTop: 6 }}>
        {entry.description}
      </T>
      {mood ? (
        <T size={15} color="#4B5563" style={{ marginTop: 10 }} accessibilityLabel={`Humor: ${mood.label}`}>
          Humor: {mood.emoji}
        </T>
      ) : null}
    </View>
  );
}

/** Menu flutuante ancorado no botão ⋮, fechado ao tocar fora. */
function ActionMenu({
  title,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  title: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ref = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const open = () =>
    ref.current?.measureInWindow((x, y, w, h) => setAnchor({ x: x + w, y: y + h }));
  const close = () => setAnchor(null);
  const pick = (fn: () => void) => () => {
    close();
    fn();
  };

  return (
    <>
      <Pressable
        ref={ref}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`Ações da entrada ${title}`}
        style={[styles.dots, anchor && styles.dotsActive]}
        hitSlop={4}
      >
        <Feather name="more-vertical" size={20} color={anchor ? colors.white : colors.text} />
      </Pressable>
      <Modal visible={!!anchor} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar menu" />
        {anchor ? (
          <View style={[styles.menu, { top: anchor.y + 4, left: Math.max(8, anchor.x - 150) }]} accessibilityViewIsModal>
            {canEdit ? (
              <Pressable onPress={pick(onEdit)} accessibilityRole="button" style={styles.menuItem}>
                <Feather name="edit-2" size={16} color={colors.text} />
                <T size={15} style={{ marginLeft: 10 }}>
                  Editar
                </T>
              </Pressable>
            ) : null}
            {canDelete ? (
              <Pressable onPress={pick(onDelete)} accessibilityRole="button" style={styles.menuItem}>
                <Feather name="trash-2" size={16} color={colors.danger} />
                <T size={15} color={colors.danger} style={{ marginLeft: 10 }}>
                  Excluir
                </T>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D6E4F5',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, marginLeft: 6 },
  dots: {
    width: 40,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: -8,
    borderRadius: 6,
  },
  dotsActive: { backgroundColor: colors.primary },
  menu: {
    position: 'absolute',
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 14 },
});
