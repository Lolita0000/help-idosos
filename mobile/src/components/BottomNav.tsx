// Barra de navegação inferior do Figma (nav-bar MVP): Dashboard, Diário, Membros e Configurações.
import { router, usePathname, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../theme';
import { T } from './ui';

type Tab = 'dashboard' | 'diario' | 'membros' | 'configuracoes';

/** Caminhos dos ícones do Figma, extraídos do SVG da barra. Cada um é desenhado numa área de 33x36 do original. */
const ICONS: Record<Tab, { viewBox: string; paths: string[]; rule?: 'evenodd' }> = {
  dashboard: {
    viewBox: '50 18 36 32',
    rule: 'evenodd',
    paths: [
      'M52.9583 47.0417C51.6528 45.7361 51 44.1667 51 42.3333C51 40.5 51.6528 38.9306 52.9583 37.625C54.2639 36.3194 55.8333 35.6667 57.6667 35.6667C59.5 35.6667 61.0694 36.3194 62.375 37.625C63.6806 38.9306 64.3333 40.5 64.3333 42.3333C64.3333 44.1667 63.6806 45.7361 62.375 47.0417C61.0694 48.3472 59.5 49 57.6667 49C55.8333 49 54.2639 48.3472 52.9583 47.0417ZM72.9583 47.0417C71.6528 45.7361 71 44.1667 71 42.3333C71 40.5 71.6528 38.9306 72.9583 37.625C74.2639 36.3194 75.8333 35.6667 77.6667 35.6667C79.5 35.6667 81.0694 36.3194 82.375 37.625C83.6806 38.9306 84.3333 40.5 84.3333 42.3333C84.3333 44.1667 83.6806 45.7361 82.375 47.0417C81.0694 48.3472 79.5 49 77.6667 49C75.8333 49 74.2639 48.3472 72.9583 47.0417ZM60.0217 44.6883C60.6739 44.035 61 43.25 61 42.3333C61 41.4167 60.6739 40.6322 60.0217 39.98C59.3694 39.3278 58.5844 39.0011 57.6667 39C56.7489 38.9989 55.9644 39.3256 55.3133 39.98C54.6622 40.6344 54.3356 41.4189 54.3333 42.3333C54.3311 43.2478 54.6578 44.0328 55.3133 44.6883C55.9689 45.3439 56.7533 45.67 57.6667 45.6667C58.58 45.6633 59.365 45.3372 60.0217 44.6883ZM80.0217 44.6883C80.6739 44.035 81 43.25 81 42.3333C81 41.4167 80.6739 40.6322 80.0217 39.98C79.3694 39.3278 78.5844 39.0011 77.6667 39C76.7489 38.9989 75.9644 39.3256 75.3133 39.98C74.6622 40.6344 74.3356 41.4189 74.3333 42.3333C74.3311 43.2478 74.6578 44.0328 75.3133 44.6883C75.9689 45.3439 76.7533 45.67 77.6667 45.6667C78.58 45.6633 79.365 45.3372 80.0217 44.6883ZM62.9583 30.375C61.6528 29.0694 61 27.5 61 25.6667C61 23.8333 61.6528 22.2639 62.9583 20.9583C64.2639 19.6528 65.8333 19 67.6667 19C69.5 19 71.0694 19.6528 72.375 20.9583C73.6806 22.2639 74.3333 23.8333 74.3333 25.6667C74.3333 27.5 73.6806 29.0694 72.375 30.375C71.0694 31.6806 69.5 32.3333 67.6667 32.3333C65.8333 32.3333 64.2639 31.6806 62.9583 30.375ZM70.0217 28.0217C70.6739 27.3683 71 26.5833 71 25.6667C71 24.75 70.6739 23.9656 70.0217 23.3133C69.3694 22.6611 68.5844 22.3344 67.6667 22.3333C66.7489 22.3322 65.9644 22.6589 65.3133 23.3133C64.6622 23.9678 64.3356 24.7522 64.3333 25.6667C64.3311 26.5811 64.6578 27.3661 65.3133 28.0217C65.9689 28.6772 66.7533 29.0033 67.6667 29C68.58 28.9967 69.365 28.6706 70.0217 28.0217Z',
    ],
  },
  diario: {
    viewBox: '142 21 27 29',
    paths: [
      'M143.125 28.625V25.875H145.875V24.5C145.875 23.7707 146.165 23.0712 146.68 22.5555C147.196 22.0397 147.896 21.75 148.625 21.75H156.875V31.375L160.312 29.3125L163.75 31.375V21.75H165.125C166.569 21.75 167.875 23.0563 167.875 24.5V46.5C167.875 47.9438 166.569 49.25 165.125 49.25H148.625C147.181 49.25 145.875 47.9438 145.875 46.5V45.125H143.125V42.375H145.875V36.875H143.125V34.125H145.875V28.625H143.125ZM148.625 34.125H145.875V36.875H148.625V34.125ZM148.625 28.625V25.875H145.875V28.625H148.625ZM148.625 45.125V42.375H145.875V45.125H148.625Z',
    ],
  },
  membros: {
    viewBox: '229 25 26 21',
    paths: [
      'M247 42.25V44.75H229.5V42.25C229.5 42.25 229.5 37.25 238.25 37.25C247 37.25 247 42.25 247 42.25ZM242.625 30.375C242.625 29.5098 242.368 28.6639 241.888 27.9444C241.407 27.225 240.724 26.6642 239.924 26.3331C239.125 26.0019 238.245 25.9153 237.396 26.0841C236.548 26.2529 235.768 26.6696 235.156 27.2815C234.545 27.8933 234.128 28.6729 233.959 29.5215C233.79 30.3702 233.877 31.2499 234.208 32.0493C234.539 32.8487 235.1 33.532 235.819 34.0127C236.539 34.4935 237.385 34.75 238.25 34.75C239.41 34.75 240.523 34.2891 241.344 33.4686C242.164 32.6482 242.625 31.5354 242.625 30.375ZM246.925 37.25C247.693 37.8447 248.322 38.6006 248.767 39.4644C249.212 40.3283 249.462 41.2791 249.5 42.25V44.75H254.5V42.25C254.5 42.25 254.5 37.7125 246.925 37.25ZM245.75 26C244.89 25.996 244.048 26.2532 243.337 26.7375C244.097 27.7985 244.505 29.0704 244.505 30.375C244.505 31.6797 244.097 32.9516 243.337 34.0125C244.048 34.4969 244.89 34.754 245.75 34.75C246.91 34.75 248.023 34.2891 248.844 33.4686C249.664 32.6482 250.125 31.5354 250.125 30.375C250.125 29.2147 249.664 28.1019 248.844 27.2815C248.023 26.461 246.91 26 245.75 26Z',
    ],
  },
  configuracoes: {
    viewBox: '335 23 31 31',
    paths: [
      'M350.591 32.0835C347.016 32.0835 344.175 34.9252 344.175 38.5002C344.175 42.0752 347.016 44.9168 350.591 44.9168C354.166 44.9168 357.008 42.0752 357.008 38.5002C357.008 34.9252 354.166 32.0835 350.591 32.0835ZM350.591 43.0835C348.025 43.0835 346.008 41.0668 346.008 38.5002C346.008 35.9335 348.025 33.9168 350.591 33.9168C353.158 33.9168 355.175 35.9335 355.175 38.5002C355.175 41.0668 353.158 43.0835 350.591 43.0835Z',
      'M364.067 35.4752L361.5 34.6502L360.95 33.2752L362.233 30.8918C362.508 30.3418 362.417 29.6085 361.958 29.1502L359.758 26.9502C359.3 26.4918 358.567 26.4002 358.017 26.6752L355.633 27.9585L354.258 27.4085L353.433 24.8418C353.25 24.2918 352.7 23.8335 352.058 23.8335H348.942C348.3 23.8335 347.75 24.2918 347.658 24.9335L346.833 27.5002C346.283 27.5918 345.825 27.7752 345.367 28.0502L342.983 26.7668C342.433 26.4918 341.7 26.5835 341.242 27.0418L339.042 29.2418C338.583 29.7002 338.492 30.4335 338.767 30.9835L339.958 33.2752C339.775 33.7335 339.592 34.2835 339.408 34.7418L336.842 35.5668C336.292 35.7502 335.833 36.3002 335.833 36.9418V40.0585C335.833 40.7002 336.292 41.2502 336.933 41.4335L339.5 42.2585L340.05 43.6335L338.767 46.0168C338.492 46.5668 338.583 47.3002 339.042 47.7585L341.242 49.9585C341.7 50.4168 342.433 50.5085 342.983 50.2335L345.367 48.9502L346.742 49.5002L347.567 52.1585C347.75 52.7085 348.3 53.1668 348.942 53.1668H352.058C352.7 53.1668 353.25 52.7085 353.433 52.1585L354.258 49.5002L355.633 48.9502L358.017 50.2335C358.567 50.5085 359.3 50.4168 359.758 49.9585L361.958 47.7585C362.417 47.3002 362.508 46.5668 362.233 46.0168L360.95 43.6335L361.5 42.2585L364.158 41.4335C364.708 41.2502 365.167 40.7002 365.167 40.0585V36.9418C365.167 36.3002 364.708 35.6585 364.067 35.4752ZM363.333 39.7835L360.033 40.7918L359.942 41.2502L359.117 43.1752L358.842 43.6335L360.492 46.6585L358.658 48.4918L355.633 46.8418L355.175 47.1168C354.533 47.4835 353.892 47.7585 353.25 47.9418L352.792 48.0335L351.783 51.3335H349.217L348.208 48.0335L347.75 47.9418L345.825 47.1168L345.367 46.8418L342.342 48.4918L340.508 46.6585L342.158 43.6335L341.883 43.1752C341.517 42.5335 341.242 41.8918 341.058 41.2502L340.967 40.7918L337.667 39.7835V37.2168L340.783 36.3002L340.967 35.8418C341.15 35.1085 341.425 34.4668 341.792 33.8252L342.067 33.3668L340.508 30.3418L342.342 28.5085L345.275 30.1585L345.733 29.8835C346.375 29.5168 347.017 29.2418 347.75 29.0585L348.208 28.8752L349.217 25.6668H351.783L352.792 28.8752L353.25 29.0585C353.892 29.2418 354.533 29.5168 355.175 29.8835L355.633 30.1585L358.658 28.5085L360.492 30.3418L358.842 33.3668L359.117 33.8252C359.483 34.4668 359.758 35.1085 359.942 35.7502L360.033 36.2085L363.333 37.2168V39.7835Z',
    ],
  },
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'diario', label: 'Diário' },
  { key: 'membros', label: 'Membros' },
  { key: 'configuracoes', label: 'Configurações' },
];

function TabIcon({ tab, color }: { tab: Tab; color: string }) {
  const { viewBox, paths, rule } = ICONS[tab];
  return (
    <Svg width={30} height={30} viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} fillRule={rule} />
      ))}
    </Svg>
  );
}

/** Telas de formulário e de confirmação, que ficam sem a barra para não distrair do que está sendo feito. */
const NO_NAV = [/^\/criar-workspace/, /^\/workspace-criado/, /\/diario\/entrada$/];

const WORKSPACE = /^\/workspace\/([^/]+)/;

function activeTab(path: string): Tab | null {
  if (/^\/(conta|acessibilidade|sobre|dados-pessoais)/.test(path)) return 'configuracoes';
  if (/^\/workspaces/.test(path)) return 'dashboard';
  if (/\/(membros|convites)$/.test(path)) return 'membros';
  if (WORKSPACE.test(path) && !/\/configuracao$/.test(path)) return 'diario';
  return null;
}

/** Diz se a barra aparece, para as telas reservarem (ou não) o espaço da área segura inferior. */
export function useBottomNavVisible(): boolean {
  const path = usePathname();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return !keyboard && !NO_NAV.some((re) => re.test(path));
}

export function BottomNav() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  // Diário e Membros precisam de um workspace: usa o último aberto.
  const lastWorkspace = useRef<string | null>(null);
  const current = WORKSPACE.exec(path)?.[1];
  if (current) lastWorkspace.current = current;
  const id = lastWorkspace.current;
  const active = activeTab(path);

  const target = (tab: Tab): Href | null => {
    switch (tab) {
      case 'dashboard':
        return '/workspaces';
      case 'configuracoes':
        return '/conta';
      case 'diario':
        return id ? { pathname: '/workspace/[id]', params: { id } } : null;
      case 'membros':
        return id ? { pathname: '/workspace/[id]/membros', params: { id, aba: 'membros' } } : null;
    }
  };

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const href = target(t.key);
        const isActive = active === t.key;
        const color = isActive ? colors.primary : 'rgba(0,0,0,0.65)';
        return (
          <Pressable
            key={t.key}
            disabled={!href}
            onPress={() => href && router.navigate(href)}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: isActive, disabled: !href }}
            style={({ pressed }) => [styles.tab, !href && { opacity: 0.4 }, pressed && { backgroundColor: '#F3F4F6' }]}
          >
            <TabIcon tab={t.key} color={color} />
            <T w="medium" size={10} color={color} numberOfLines={1}>
              {t.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  tab: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
});
