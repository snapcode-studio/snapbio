import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const SLUG_COOLDOWN_HOURS = 24;
const SLUG_REGEX = /^[a-z0-9-]{3,30}$/;

export const validateSlugFormat = (slug) => {
  if (!slug) return { valid: false, error: 'Slug nie może być pusty.' };
  if (slug.length < 3) return { valid: false, error: 'Minimum 3 znaki.' };
  if (slug.length > 30) return { valid: false, error: 'Maksimum 30 znaków.' };
  if (!SLUG_REGEX.test(slug)) return { valid: false, error: 'Tylko małe litery, cyfry i myślniki.' };
  return { valid: true };
};

export const checkSlugAvailable = async (slug, currentUid) => {
  const slugDoc = await getDoc(doc(db, 'slugs', slug));
  if (!slugDoc.exists()) return { available: true };
  // Slug exists — check if it belongs to current user
  if (slugDoc.data().uid === currentUid) return { available: false, isOwn: true };
  return { available: false, isOwn: false };
};

export const claimSlug = async (uid, newSlug, oldSlug, lastSlugChange) => {
  // Rate limit check
  if (lastSlugChange) {
    const last = new Date(lastSlugChange);
    const diffHours = (Date.now() - last.getTime()) / 3600000;
    if (diffHours < SLUG_COOLDOWN_HOURS) {
      const remaining = Math.ceil(SLUG_COOLDOWN_HOURS - diffHours);
      throw new Error(`Możesz zmienić slug ponownie za ${remaining}h.`);
    }
  }

  // Delete old slug index if exists
  if (oldSlug && oldSlug !== newSlug) {
    try { await deleteDoc(doc(db, 'slugs', oldSlug)); } catch {}
  }

  // Reserve new slug
  await setDoc(doc(db, 'slugs', newSlug), { uid, claimedAt: new Date().toISOString() });

  // Update user profile
  await updateDoc(doc(db, 'users', uid), {
    'bioProfile.slug': newSlug,
    'bioProfile.lastSlugChange': new Date().toISOString()
  });
};
