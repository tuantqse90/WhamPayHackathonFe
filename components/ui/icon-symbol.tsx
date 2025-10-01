// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock.fill': 'access-time',
  'qrcode.viewfinder': 'qr-code-scanner',
  'gearshape.fill': 'settings',
  'arrow.up.right': 'arrow-outward',
  'arrow.down.left': 'arrow-downward',
  'plus.circle.fill': 'add-circle',
  'arrow.left.arrow.right': 'swap-horiz',
  'camera.fill': 'camera-alt',
  'qrcode': 'qr-code',
  'person.circle.fill': 'account-circle',
  'shield.fill': 'security',
  'bell.fill': 'notifications',
  'faceid': 'face',
  'questionmark.circle.fill': 'help',
  'doc.text.fill': 'description',
  'doc.plaintext.fill': 'article',
  'arrow.right.square.fill': 'logout',
  'person.2.fill': 'people',
  'gift.fill': 'card-giftcard',
  'link': 'link',
  'at': 'alternate-email',
  'gift': 'card-giftcard',
  'checkmark.circle.fill': 'check-circle',
  'circle': 'radio-button-unchecked',
  'xmark': 'close',
  'chevron.left': 'chevron-left',
  'applelogo': 'apple',
  'creditcard.fill': 'credit-card',
  'dollarsign.circle.fill': 'attach-money',
  'arrow.right': 'arrow-forward',
  'arrow.up.arrow.down': 'swap-vert',
  'person.2': 'people',
  'star.fill': 'star',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'message': 'message',
  'gearshape': 'settings',
  'power': 'power-settings-new',
  'pencil': 'edit',
  'arrow.up': 'arrow-upward',
  'arrow.down': 'arrow-downward',
  'arrow.clockwise': 'refresh',
  'checkmark': 'check',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
