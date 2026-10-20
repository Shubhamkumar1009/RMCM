using { rmc as db } from '../db/schema';

@path: '/odata/v4/admin'
@requires: 'RmcAdmin'
service AdminService {
  entity AppSettings        as projection on db.AppSettings;
  entity MovementTypeRules  as projection on db.MovementTypeRules;
  entity ApprovalPolicies   as projection on db.ApprovalPolicies;
  entity PriceRuleTemplates as projection on db.PriceRuleTemplates;
  @readonly entity SystemEvents as projection on db.SystemEvents;

  action resetDemoData() returns String;
}
