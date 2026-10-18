import {Component, Input} from '@angular/core';
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {TextboxComponent} from "./textbox.component";
import {NgClass} from "@angular/common";
import { FieldTree } from '@angular/forms/signals';

@Component({
    selector: 'app-search-bar',
    imports: [
        TextboxComponent,
        NgClass
    ],
    template: `
    <app-textbox [formField]="queryFormField" ctrlName="query" [icon]="faSearch" placeholder="Search for levels..." [ngClass]="appClass"></app-textbox>
  `
})
export class SearchBarComponent {
  // TODO once we do add filter options to the search bar, we should think of whether they will be all in one FieldTree
  // which will be under SearchComponent's FieldTree, or whether we should just pass every field's FieldTree individually
  @Input({required: true}) queryFormField: FieldTree<string, string, "writable"> = null!;
  @Input() appClass: string = "";

  protected readonly faSearch = faSearch;
}
