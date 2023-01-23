import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Donor } from 'src/app/interfaces/interface';
import { HttpClientService } from 'src/app/services/server-communication/http-client/http-client.service';

@Component({
  selector: 'app-donors-list',
  templateUrl: './donors-list.component.html',
  styleUrls: ['./donors-list.component.css'],
})
export class DonorsListComponent implements OnInit {
  donors: Donor[] = [];

  constructor(private httpClient: HttpClientService, private router: Router) {}

  ngOnInit(): void {
    this.httpClient.get('/donors').subscribe((donors: Donor[]) => {
      this.donors = donors;
    });
  }

  navigateTo(relativeUrl: string) {
    this.router.navigateByUrl(relativeUrl);
  }

}
