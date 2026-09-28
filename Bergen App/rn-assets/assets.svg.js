/* Vector variants. Requires react-native-svg + react-native-svg-transformer.
 * Icons are stroke-only and use currentColor, so one component covers every
 * colour and both themes:
 *
 *   import { IconsSvg } from './rn-assets/assets.svg';
 *   const Home = IconsSvg.home;
 *   <Home width={21} height={21} color="#2d7a4f" />
 *
 * The illustrations are already themed, so they come as { light, dark } pairs.
 */

export const IconsSvg = {
  'arrow-right': require('./icons/svg/arrow-right.svg').default,
  bell: require('./icons/svg/bell.svg').default,
  book: require('./icons/svg/book.svg').default,
  briefcase: require('./icons/svg/briefcase.svg').default,
  cake: require('./icons/svg/cake.svg').default,
  calendar: require('./icons/svg/calendar.svg').default,
  card: require('./icons/svg/card.svg').default,
  chart: require('./icons/svg/chart.svg').default,
  check: require('./icons/svg/check.svg').default,
  'chev-down': require('./icons/svg/chev-down.svg').default,
  'chev-left': require('./icons/svg/chev-left.svg').default,
  'chev-right': require('./icons/svg/chev-right.svg').default,
  click: require('./icons/svg/click.svg').default,
  clock: require('./icons/svg/clock.svg').default,
  dashboard: require('./icons/svg/dashboard.svg').default,
  device: require('./icons/svg/device.svg').default,
  edit: require('./icons/svg/edit.svg').default,
  eye: require('./icons/svg/eye.svg').default,
  'eye-off': require('./icons/svg/eye-off.svg').default,
  globe: require('./icons/svg/globe.svg').default,
  heart: require('./icons/svg/heart.svg').default,
  home: require('./icons/svg/home.svg').default,
  image: require('./icons/svg/image.svg').default,
  info: require('./icons/svg/info.svg').default,
  lock: require('./icons/svg/lock.svg').default,
  logout: require('./icons/svg/logout.svg').default,
  mail: require('./icons/svg/mail.svg').default,
  megaphone: require('./icons/svg/megaphone.svg').default,
  moon: require('./icons/svg/moon.svg').default,
  music: require('./icons/svg/music.svg').default,
  palette: require('./icons/svg/palette.svg').default,
  phone: require('./icons/svg/phone.svg').default,
  pin: require('./icons/svg/pin.svg').default,
  play: require('./icons/svg/play.svg').default,
  plus: require('./icons/svg/plus.svg').default,
  school: require('./icons/svg/school.svg').default,
  search: require('./icons/svg/search.svg').default,
  settings: require('./icons/svg/settings.svg').default,
  sliders: require('./icons/svg/sliders.svg').default,
  soccer: require('./icons/svg/soccer.svg').default,
  star: require('./icons/svg/star.svg').default,
  stethoscope: require('./icons/svg/stethoscope.svg').default,
  sun: require('./icons/svg/sun.svg').default,
  tag: require('./icons/svg/tag.svg').default,
  tent: require('./icons/svg/tent.svg').default,
  theater: require('./icons/svg/theater.svg').default,
  tooth: require('./icons/svg/tooth.svg').default,
  trash: require('./icons/svg/trash.svg').default,
  trending: require('./icons/svg/trending.svg').default,
  upload: require('./icons/svg/upload.svg').default,
  user: require('./icons/svg/user.svg').default,
  users: require('./icons/svg/users.svg').default,
  verified: require('./icons/svg/verified.svg').default,
  video: require('./icons/svg/video.svg').default,
  waves: require('./icons/svg/waves.svg').default,
  x: require('./icons/svg/x.svg').default,
};

export const IllustrationsSvg = {
  'hills-signin': { light: require('./illustrations/svg/hills-signin-light.svg').default, dark: require('./illustrations/svg/hills-signin-dark.svg').default },
  'hills-splash': { light: require('./illustrations/svg/hills-splash-light.svg').default, dark: require('./illustrations/svg/hills-splash-dark.svg').default },
  kite: { light: require('./illustrations/svg/kite-light.svg').default, dark: require('./illustrations/svg/kite-dark.svg').default },
  sun: { light: require('./illustrations/svg/sun-light.svg').default, dark: require('./illustrations/svg/sun-dark.svg').default },
};

export const BackgroundsSvg = {
  'signup-bg': { light: require('./backgrounds/svg/signup-bg-light.svg').default, dark: require('./backgrounds/svg/signup-bg-dark.svg').default },
  'splash-bg': { light: require('./backgrounds/svg/splash-bg-light.svg').default, dark: require('./backgrounds/svg/splash-bg-dark.svg').default },
  'welcome-bg': { light: require('./backgrounds/svg/welcome-bg-light.svg').default, dark: require('./backgrounds/svg/welcome-bg-dark.svg').default },
};

export const PlaceholdersSvg = {
  'ad-creative': require('./placeholders/svg/ad-creative.svg').default,
  'photo-arts': require('./placeholders/svg/photo-arts.svg').default,
  'photo-camps': require('./placeholders/svg/photo-camps.svg').default,
  'photo-medical': require('./placeholders/svg/photo-medical.svg').default,
  'photo-music': require('./placeholders/svg/photo-music.svg').default,
  'photo-parties': require('./placeholders/svg/photo-parties.svg').default,
  'photo-schools': require('./placeholders/svg/photo-schools.svg').default,
  'photo-sports': require('./placeholders/svg/photo-sports.svg').default,
  'photo-tutoring': require('./placeholders/svg/photo-tutoring.svg').default,
};

export default { IconsSvg, IllustrationsSvg, BackgroundsSvg, PlaceholdersSvg };
