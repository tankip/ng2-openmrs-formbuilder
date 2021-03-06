import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import {AceEditorComponent} from 'ng2-ace-editor';
import {NavigatorService} from '../../Services/navigator.service';
import {MdSnackBar} from '@angular/material';
import { FormSchemaCompiler } from 'ng2-openmrs-formentry';
import {FetchFormDetailService} from '../../Services/fetch-form-detail.service'
import 'brace/index';
import 'brace/mode/json';
import 'brace/theme/chrome';
import 'brace/theme/cobalt';
import 'brace/ext/searchbox';


@Component({
  selector: 'app-schema-editor',
  templateUrl: './schema-editor.component.html',
  styleUrls: ['./schema-editor.component.css']
})


export class SchemaEditorComponent implements OnInit,OnDestroy {

   @ViewChild('editor') editor;
   private _schema:string;
   private _selectedSchemaObj:any;
   private _rawSchema:string;
   private _selectedRawSchema:Object;
   private _formSchema:any; //full form schema
   pageIndex:number;
   sectionIndex:number;
   questionIndex:number;
   referencedForms:any[];
   badge:string="Compiled";
   viewingUncompiled:boolean=false;
   tooltip:string="View Raw";
 
   @Input()
   set schema(newSchema:string){
      this._schema = newSchema;
      this.viewingUncompiled = false;
      this.editor.setTheme('chrome')
      this.editor.setText(this._schema);
      this.editor.getEditor().scrollToLine(0);
      this.editor.viewingUncompiled = false;
      this.editor.getEditor().setOptions({readOnly:false});
      this.tooltip="View Raw";
      this.badge="Compiled"
   }

   @Input()
   set rawSchema(schema){
     this._rawSchema = schema;
   }
 
   @Input()
   set selectedRawSchema(schema){
      this._selectedRawSchema = schema;
   }
  

   @Input()
   set selectedSchema(newSchema:any){
     this._selectedSchemaObj = newSchema;
     if(this._selectedSchemaObj.pages) this._formSchema = this._selectedSchemaObj
     if(this._selectedSchemaObj.hasOwnProperty('selectedSchema')) {
       
       this.pageIndex = this._selectedSchemaObj['pageIndex'];
       this.sectionIndex = this._selectedSchemaObj['sectionIndex'];
       this.questionIndex = this._selectedSchemaObj['questionIndex'];
     }
   }

   @Input() set $formSchema(schema:any){
     this._formSchema = schema;
   }
  constructor(private ns:NavigatorService,public snackbar:MdSnackBar,private fsc:FormSchemaCompiler,private fs:FetchFormDetailService) {
    
   }

  ngOnInit() {

    this.fs.getReferencedFormsArray().subscribe(refFormArray => this.referencedForms=refFormArray)

    this.editor.getEditor().setOptions({
            printMargin:false
        });
          this.editor.setTheme('chrome');
          this.editor.setMode('json');
          this.editor.getEditor().setFontSize(16);
          this.editor.getEditor().setOptions({readOnly:true});
    
           
  }

  //render button
  render(){
    let editedSchema=this.editor.getEditor().getValue();

    editedSchema = this.compileSchema(JSON.parse(editedSchema));
    
    if(editedSchema.pages){
      this.ns.setSchema(editedSchema);
      return;
    }

    else if(editedSchema.sections){
      this._formSchema.pages[this.pageIndex]= editedSchema;
    }

    else if(editedSchema.questions){
      this._formSchema.pages[this.pageIndex].sections[this.sectionIndex] = editedSchema
    }
    else{
      this._formSchema.pages[this.pageIndex].sections[this.sectionIndex].questions[this.questionIndex] = editedSchema
    }
    this.ns.setSchema(this._formSchema)
    return;
  }

  compileSchema(schema:Object){
    return this.fsc.compileFormSchema(schema,this.referencedForms)
  }

  showSnackbar(){
      this.snackbar.open("Copied to clipboard","",{duration:1200});
  }

  ngOnDestroy(){
    
  }

  toggleEditor(){

   this.viewingUncompiled==false ? this.viewingUncompiled=true : this.viewingUncompiled=false;
   if(this.viewingUncompiled) {
     this.badge="Raw";
     this.editor.setTheme('cobalt')
     this.editor.setText(this._rawSchema,null,"\t");
     this.tooltip="View Compiled";
     this.editor.getEditor().setOptions({readOnly:true});
     this.editor.getEditor().scrollToLine(0);
   }
   else {
     this.badge="Compiled";
     this.editor.setTheme('chrome')
     this.editor.setText(this._schema);
     this.editor.getEditor().setOptions({readOnly:true});
     this.tooltip="View Raw";
     this.editor.getEditor().scrollToLine(0);
    }
    
  }


  viewFullSchema(){
    let schema = JSON.parse(this._schema);
    this.editor.setText(JSON.stringify(this._formSchema,null,"\t"));
    let line = this.findCurrentLineNumbers(this.editor.getEditor(),schema.label);
    this.editor.getEditor().scrollToLine(line[0]);
    this._schema=JSON.stringify(this._formSchema);
    this.editor.getEditor().setOptions({readOnly:true});    this.ns.getRawSchema().subscribe(schema => {
      this._rawSchema = JSON.stringify(schema,null,"\t");
    });
    
  }


 findCurrentLineNumbers(editor, foo) {
    var lines = editor.session.doc.getAllLines();
    var fooLineNumbers=[];
    for (var i = 0;i < lines.length; i++) {
        if (lines[i].indexOf(foo) != -1){
          fooLineNumbers.push(i);
          console.log(lines[i],foo,fooLineNumbers);
        }
        
    }
    
    return fooLineNumbers;
}
}
