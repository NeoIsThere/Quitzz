import { IconFile } from './interfaces/interface';

export class IconsMetaData {
  static get iconFiles(): IconFile[] {
    return [
      {
        name: 'silver',
        path: './assets/icons/silver.svg',
      },
      {
        name: 'gold',
        path: './assets/icons/gold.svg',
      },
      {
        name: 'lightning',
        path: './assets/icons/lightning.svg',
      },
      {
        name: 'lightning-grey',
        path: './assets/icons/lightning_grey.svg',
      },
      {
        name: 'bronze',
        path: './assets/icons/bronze.svg',
      },
    ];
  }
}
