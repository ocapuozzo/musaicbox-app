import {GroupAction} from "../core/GroupAction";
import {MusaicOperation} from "../core/MusaicOperation";

export const GROUP_NAMES = ['Trivial', 'Cyclic', 'Dihedral', 'Affine', 'Musaic'] as const;
export type TGroupeName = typeof GROUP_NAMES[number];

/**
 * with n = 12, there are 17 (16+1) possibles groups
 * (see Labo.spec.ts - 'Explore all sub-group of musaic group - up to transposition')
 */
const GROUPS_NAMES_N12 = [
  {groupName: "n=12 []", alias: "Trivial"}, // only M1-T0 (neutral operation - not represented)
  {groupName: "n=12 [M1]", alias: "Cyclic"}, // all Mx and CMx are with -T1 (transposition by step 1)
  {groupName: "n=12 [M1 M5]", alias: ""},
  {groupName: "n=12 [M1 M7]", alias: ""},
  {groupName: "n=12 [M1 M11]", alias: "Dihedral"},
  {groupName: "n=12 [M1 CM1]", alias: ""},
  {groupName: "n=12 [M1 CM5]", alias: ""},
  {groupName: "n=12 [M1 CM7]", alias: ""},
  {groupName: "n=12 [M1 CM11]", alias: ""},
  {groupName: "n=12 [M1 M5 M7 M11]", alias: "Affine"},
  {groupName: "n=12 [M1 M5 CM1 CM5]", alias: ""},
  {groupName: "n=12 [M1 M5 CM7 CM11]", alias: ""},
  {groupName: "n=12 [M1 M7 CM1 CM7]", alias: ""},
  {groupName: "n=12 [M1 M7 CM5 CM11]", alias: ""},
  {groupName: "n=12 [M1 M11 CM1 CM11]", alias: ""},
  {groupName: "n=12 [M1 M11 CM5 CM7]", alias: ""},
  {groupName: "n=12 [M1 M5 M7 M11 CM1 CM5 CM7 CM11]", alias: "Musaic"}
]

/*
Other sort on orbit cardinal (from Labo.spec.ts) :
'n=12 [] => 4096' // M1-T0
'n=12 [M1] => 352'
'n=12 [M1 M7] => 226'
'n=12 [M1 M11] => 224'
'n=12 [M1 M5] => 218'
'n=12 [M1 CM11] => 192'
'n=12 [M1 CM5] => 186'
'n=12 [M1 CM7] => 182'
'n=12 [M1 CM1] => 180'
'n=12 [M1 M5 M7 M11] => 158'
'n=12 [M1 M7 CM5 CM11] => 126'
'n=12 [M1 M11 CM1 CM11] => 122'
'n=12 [M1 M11 CM5 CM7] => 120'
'n=12 [M1 M5 CM7 CM11] => 120'
'n=12 [M1 M7 CM1 CM7] => 118'
'n=12 [M1 M5 CM1 CM5] => 116'
'n=12 [M1 M5 M7 M11 CM1 CM5 CM7 CM11] => 88'

 */

export class ManagerGroupActionService {

  // key : group name,  value : GroupAction instance
  static GROUP_ACTION_INSTANCES: Map<string, GroupAction> = new Map<string, GroupAction>()

  constructor() {
  }

  static buildGroupActionFromGroupName(groupName: string) {
    const someOperations: MusaicOperation[] = this._buildOperationsFromGroupName(groupName)
    if (someOperations.length === 0) {
      console.error(`buildGroupActionFromGroupName Impossible : ${groupName}`)
      someOperations.push(new MusaicOperation(12, 1, 0, false)) // M1-T0, trivial group

       // throw new Error(`buildGroupActionFromGroupName Impossible : ${groupName}`)
    }
    return new GroupAction({n: someOperations[0].n, someMusaicOperations: someOperations});
  }

  /**
   * Build MusaicOperation[] from name op without Tx.
   * Example : "n=2 [M1 CM7]" => M1-T1, CM7-T1 (MusaicOperation instances)
   * @param groupName example "n=12 [M1 M5 M7 M11]"
   * @private
   */
  static _buildOperationsFromGroupName(groupName: string): MusaicOperation[] {
    let operations: MusaicOperation[] = []
    const n = parseInt(groupName.substring(2, groupName.indexOf("[")))
    if (Number.isInteger(n) && n > 0) {
      const opsName = groupName.substring(groupName.indexOf("[") + 1, groupName.length - 1).split(" ")
      const t = 1
      for (let i = 0; i < opsName.length; i++) {
        const complement = opsName[i].startsWith("C")
        const a = parseInt(opsName[i].substring(complement ? 2 : 1))
        if (Number.isInteger(a) && a) {
          operations.push(new MusaicOperation(n, a, t, complement))
        }
      }
    }
    return operations;
  }

  /**
   * Get GroupAction instance from a groupName (as Group.name) i.e. "n=12 [M1]"
   * if GroupAction instance exists into ManagerGroupActionService.GROUP_ACTION_INSTANCES, then return it
   * else create new instance and put it into ManagerGroupActionService.GROUP_ACTION_INSTANCES
   * @param groupName
   */
  static getGroupActionFromGroupName(groupName: string): GroupAction | undefined {
    if (!ManagerGroupActionService.GROUP_ACTION_INSTANCES.has(groupName)) {
      // in static context, 'this' refer to class, not instance
      const newGroupName = '' + groupName
      const groupAction: GroupAction = this.buildGroupActionFromGroupName(newGroupName)
      ManagerGroupActionService.GROUP_ACTION_INSTANCES.set(groupName, groupAction)
    }
    return ManagerGroupActionService.GROUP_ACTION_INSTANCES.get(groupName)
  }

  static getGroupActionFromGroupAliasName(aliasName: TGroupeName) {
    const groupNameTuple = this.findGroupName(aliasName)
    if (groupNameTuple) {
      return this.getGroupActionFromGroupName(groupNameTuple.groupName)
    }
    return undefined
  }

  static findGroupName(alias: string) {
    return GROUPS_NAMES_N12.find(value => value.alias === alias)
  }

}
