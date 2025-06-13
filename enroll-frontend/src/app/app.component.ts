import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoaderComponent } from './components/loader/loader.component'; 
import { FootbarComponent } from './components/footbar/footbar.component'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavBarComponent, LoaderComponent, FootbarComponent], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { 
  title = 'UniFinder'; 
}
