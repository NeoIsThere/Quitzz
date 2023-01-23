import { Component, OnInit } from '@angular/core';
import { Partner } from 'src/app/interfaces/interface';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent implements OnInit {
  partners: Partner[] = [
    {
      name: 'Porn-Free',
      description:
        'A young Discord server that is quickly growing and full of motivated people.',
      imagePath: './assets/images/pf.png',
      link: 'https://discord.gg/6yqszeSDRn',
    },
    {
      name: 'No Nut Central',
      description:
        ' A chill Discord server aiming to provide support to pornography & masturbation addicts. \
        You may also join the ride to achieve big numbers in your streak for the sake of monthly challenges such as NNN / DDD...',
      imagePath: './assets/images/NNC.jpg',
      link: 'https://discord.gg/mhx3xyXBYM',
    },
    {
      name: 'Pornfree',
      description:
        'The Reddit community to help people of all ages overcome their addiction to porn.',
      imagePath: './assets/images/reddit.png',
      link: 'https://www.reddit.com/r/pornfree/',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
