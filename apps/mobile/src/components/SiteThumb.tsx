import { FileText, Image as ImageIcon, Mic } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { T } from '@/components/ui';
import { mediaUrl } from '@/lib/field';
import { api, useSession } from '@/session/session';
import { colour, radius } from '@/theme';

/**
 * The picture beside an item in the lists (M7, M8): the phone's own thumbnail; else, once the server has the item, its
 * photo from there (the phone deletes its copy after verification); else an icon for what the item is (a daily report,
 * a voice note), never an empty box.
 */
export function SiteThumb({ localUri, mediaId, kind, size = 72 }: { localUri?: string | null; mediaId?: string | null; kind: string; size?: number }) {
  const s = useSession().strings;
  const [remote, setRemote] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (localUri || !mediaId) return;
    let alive = true;
    void mediaUrl(api, mediaId, 'thumb')
      .then((url) => alive && setRemote(url))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [localUri, mediaId]);

  const box = { width: size, height: size };
  const uri = localUri ?? (failed ? null : remote);
  if (uri) return <Image source={{ uri }} style={[styles.thumb, box]} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />;

  // No picture to show: say what the item is.
  const Icon = kind === 'daily_report' ? FileText : kind === 'incident' && !mediaId ? Mic : ImageIcon;
  const label = kind === 'daily_report' ? s.thumb.report : kind === 'incident' && !mediaId ? s.thumb.voice : mediaId && !failed ? s.thumb.loading : s.thumb.photo;
  return (
    <View style={[styles.thumb, styles.icon, box]} accessibilityLabel={label}>
      <Icon size={24} color={colour.text} />
      <T variant="label" style={styles.center} numberOfLines={2}>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { borderRadius: radius.md, backgroundColor: colour.muted },
  icon: { alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4 },
  center: { textAlign: 'center' },
});
