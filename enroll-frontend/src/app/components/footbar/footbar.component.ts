import { Component } from '@angular/core';

@Component({
    selector: 'app-footbar',
    templateUrl: './footbar.component.html',
    styleUrls: ['./footbar.component.css'],
    standalone: true
})
export class FootbarComponent {
    currentYear: number = new Date().getFullYear();
    companyName: string = 'UniFinder';
}