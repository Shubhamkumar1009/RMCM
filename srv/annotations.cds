using RmcService as service from './rmc-service';

annotate service.PriceChangeRequests with @(
  UI.HeaderInfo: {
    TypeName: 'Commodity Price Change',
    TypeNamePlural: 'Commodity Price Changes',
    Title: { Value: requestNumber },
    Description: { Value: reason }
  },
  UI.SelectionFields: [status, validFrom],
  UI.LineItem: [
    { Value: requestNumber, Label: 'Request' },
    { Value: status, Label: 'Status' },
    { Value: oldPrice, Label: 'Old Price' },
    { Value: proposedPrice, Label: 'Proposed Price' },
    { Value: currency, Label: 'Currency' },
    { Value: validFrom, Label: 'Effective From' }
  ]
);

annotate service.CalculationRuns with @(
  UI.HeaderInfo: {
    TypeName: 'Impact Calculation',
    TypeNamePlural: 'Impact Calculations',
    Title: { Value: runNumber },
    Description: { Value: status }
  },
  UI.SelectionFields: [status, periodFrom, periodTo],
  UI.LineItem: [
    { Value: runNumber, Label: 'Run' },
    { Value: status, Label: 'Status' },
    { Value: periodFrom, Label: 'From' },
    { Value: periodTo, Label: 'To' },
    { Value: processedGrCount, Label: 'GR Lines' },
    { Value: totalAmount, Label: 'Impact' },
    { Value: currency, Label: 'Currency' }
  ]
);
