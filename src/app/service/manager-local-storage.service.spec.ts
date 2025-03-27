import {TestBed} from '@angular/core/testing';

import {ManagerLocalStorageService} from './manager-local-storage.service';

describe('ManagerLocalStorageService', () => {
  let service: ManagerLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it ("serialized data with one PCS n=7 nMapping=12",  () => {
    const serialPcs = `
     [
    {
        "pcs": null,
        "colorPitchOn": "black",
        "colorPitchOff": "white",
        "id": "5971742885687833",
        "freeText": {
            "text": "[0 2 5 9]",
            "width": 48,
            "height": 22,
            "fontSize": "12px"
        },
        "position": {
            "x": 111,
            "y": 35
        },
        "indexFormDrawer": 1,
        "isSelected": true,
        "showName": true,
        "showPcs": false,
        "showPivot": true,
        "octotrope": {
            "size": 50
        },
        "uiMusaic": {
            "rounded": false,
            "opaque": true,
            "nbCellsPerLine": 13,
            "nbCellsPerRow": 13,
            "widthCell": 7,
            "width": 91,
            "height": 91
        },
        "uiClock": {
            "drawPolygon": false,
            "radiusPitch": 10,
            "textWidthAuto": true,
            "textWidth": 10,
            "colorPitchOn": "yellow",
            "width": 91,
            "height": 91
        },
        "uiScore": {
            "height": 76,
            "width": 130
        },
        "serializedPcs": {
            "strPcs": "[0 2 4 6]",
            "n": 7,
            "iPivot": 0,
            "nMapping": 12,
            "vectorMapping": [
                0,
                2,
                4,
                5,
                7,
                9,
                11
            ],
            "groupName": ""
        }
    }
]`
     let x = 0
     const arrayUIPcsDto = service.getPcsDtoListFromJsonContent(serialPcs)
     expect(arrayUIPcsDto.length).toEqual(1)
     expect(arrayUIPcsDto[0].pcs.n).toEqual(7)
     expect(arrayUIPcsDto[0].pcs.vectorMapping).toEqual([0,2,4,5,7,9,11])
  });


});
