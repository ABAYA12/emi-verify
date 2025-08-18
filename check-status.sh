#!/bin/bash
echo "=== EMI Verify Production Deployment Status ==="
echo ""
echo "🌐 Production URLs:"
echo "   Frontend: https://emiverify.insightgridanalytic.com"
echo "   Email Verification: https://emiverify.insightgridanalytic.com/verify-email"
echo "   API Health: https://emiverify.insightgridanalytic.com/health"
echo ""
echo "🐳 Database Containers:"
sudo docker-compose ps
echo ""
echo "🏥 Service Health Checks:"
echo -n "Frontend: "
curl -w "%{http_code}" -s -o /dev/null https://emiverify.insightgridanalytic.com && echo " ✅" || echo " ❌"
echo -n "Email Verification: "
curl -w "%{http_code}" -s -o /dev/null https://emiverify.insightgridanalytic.com/verify-email && echo " ✅" || echo " ❌"
echo -n "API Health: "
curl -w "%{http_code}" -s -o /dev/null https://emiverify.insightgridanalytic.com/health && echo " ✅" || echo " ❌"
echo -n "Backend Local: "
curl -w "%{http_code}" -s -o /dev/null http://localhost:3001/health && echo " ✅" || echo " ❌"
echo ""
echo "📊 Database Status:"
if sudo docker-compose exec -T postgres pg_isready -U emi_admin > /dev/null 2>&1; then
    echo "Database: ✅ Ready"
else
    echo "Database: ❌ Not ready"
fi
echo ""
echo "🔧 Backend Process:"
if pgrep -f "node server.js" > /dev/null; then
    echo "Backend: ✅ Running (PID: $(pgrep -f 'node server.js'))"
else
    echo "Backend: ❌ Not running"
fi
echo ""
echo "📝 Recent Backend Logs:"
tail -10 /home/ubuntu/emi-verify/backend/server.log 2>/dev/null || echo "No logs found"
