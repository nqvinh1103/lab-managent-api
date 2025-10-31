#!/bin/bash
# Quick script to fix remaining services
cd /e/lab-management/lab-managent-api

# Fix reagentVendorSupply.service.ts
sed -i 's/  private collection = getCollection<ReagentVendorSupplyHistoryDocument>('"'"'reagent_vendor_supply_history'"'"');/  private getCollection() {\n    return getCollection<ReagentVendorSupplyHistoryDocument>('"'"'reagent_vendor_supply_history'"'"');\n  }/' src/services/reagentVendorSupply.service.ts
sed -i 's/this\.collection/this.getCollection()/g' src/services/reagentVendorSupply.service.ts

# Fix reagentUsageHistory.service.ts
sed -i 's/  private collection = getCollection<ReagentUsageHistoryDocument>('"'"'reagent_usage_history'"'"');/  private getCollection() {\n    return getCollection<ReagentUsageHistoryDocument>('"'"'reagent_usage_history'"'"');\n  }/' src/services/reagentUsageHistory.service.ts
sed -i 's/this\.collection/this.getCollection()/g' src/services/reagentUsageHistory.service.ts

echo "Done!"

