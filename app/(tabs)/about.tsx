/**
 * About Screen
 * Premium Apple-style design with lightchurch.fr dark aesthetic
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchStats } from '@/services/mapService';

const APP_VERSION = '1.0.0';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, iconColor, label, subtitle, onPress, showChevron = true }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.menuIcon, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.25)" />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const [churches, setChurches] = useState(0);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    fetchStats()
      .then(data => {
        if (data.success && data.stats) {
          setChurches(data.stats.churches || 0);
          const s = data.stats as Record<string, number>;
          setEvents(s.events || (s.ongoingEvents || 0) + (s.upcomingEvents || 0) || 0);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenWebsite = () => Linking.openURL('https://lightchurch.fr');
  const handleOpenEmail = () => Linking.openURL('mailto:contact@lightchurch.fr');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#0F172A', '#020617']}
          style={[styles.hero, { paddingTop: insets.top + 32 }]}
        >
          <Text style={styles.heroTitle}>Light Church</Text>
          <Text style={styles.heroTagline}>
            L'information chrétienne{'\n'}
            <Text style={styles.heroTaglineAccent}>enfin centralisée.</Text>
          </Text>
          <Text style={styles.heroVersion}>Version {APP_VERSION}</Text>

          {/* Mini Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>
                {churches > 0 ? churches.toLocaleString('fr-FR') : '—'}
              </Text>
              <Text style={styles.statUnit}>églises</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>
                {events > 0 ? events.toLocaleString('fr-FR') : '—'}
              </Text>
              <Text style={styles.statUnit}>événements</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Links Section */}
        <SectionHeader title="Liens" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="globe-outline"
            iconColor="#3B82F6"
            label="Site web"
            subtitle="lightchurch.fr"
            onPress={handleOpenWebsite}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="mail-outline"
            iconColor="#8B5CF6"
            label="Nous contacter"
            subtitle="contact@lightchurch.fr"
            onPress={handleOpenEmail}
          />
        </View>

        {/* Privacy Section */}
        <SectionHeader title="Confidentialité" />
        <View style={styles.menuGroup}>
          <View style={styles.policyContainer}>
            <PolicyItem
              title="Collecte de données"
              text="Light Church collecte uniquement votre position géographique pour afficher les églises et événements à proximité. Aucune autre donnée personnelle n'est collectée."
            />
            <PolicyItem
              title="Utilisation"
              text="Vos données de localisation sont utilisées uniquement côté client pour calculer les distances. Elles ne sont jamais transmises ni stockées sur nos serveurs."
            />
            <PolicyItem
              title="Notifications"
              text="Si vous activez les notifications, votre token est stocké de manière chiffrée pour vous informer des mises à jour d'événements. Désactivable à tout moment."
            />
            <PolicyItem
              title="Stockage local"
              text="Vos préférences et favoris sont sauvegardés localement sur votre appareil. Ces données ne quittent jamais votre téléphone."
            />
            <PolicyItem
              title="Partage"
              text="Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers."
            />
            <PolicyItem
              title="Vos droits (RGPD)"
              text="Vous pouvez accéder, rectifier ou supprimer vos données à tout moment en nous contactant."
              isLast
            />
          </View>
        </View>

        {/* Legal Section */}
        <SectionHeader title="Informations légales" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="document-text-outline"
            iconColor="#6B7280"
            label="Conditions d'utilisation"
            onPress={handleOpenWebsite}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="shield-checkmark-outline"
            iconColor="#10B981"
            label="Politique de confidentialité"
            onPress={handleOpenWebsite}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Fait avec soin en France
          </Text>
          <Text style={styles.footerCopyright}>
            © 2026 Light Church. Tous droits réservés.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function PolicyItem({ title, text, isLast = false }: { title: string; text: string; isLast?: boolean }) {
  return (
    <View style={[styles.policyItem, !isLast && styles.policyItemBorder]}>
      <Text style={styles.policyTitle}>{title}</Text>
      <Text style={styles.policyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTagline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  heroTaglineAccent: {
    color: '#3B82F6',
  },
  heroVersion: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 20,
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  statUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Section Headers
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },

  // Menu Groups
  menuGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 60,
  },

  // Policy
  policyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  policyItem: {
    paddingVertical: 14,
  },
  policyItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.45)',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  footerCopyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    marginTop: 4,
  },
});
