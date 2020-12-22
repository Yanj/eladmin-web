rm dist.tar.gz
tar -czf dist.tar.gz dist/
scp -P 1022 dist.tar.gz root@111.231.99.17:/var/www/eladmin/