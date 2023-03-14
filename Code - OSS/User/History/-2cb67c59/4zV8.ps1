$firstFile=Get-Content -Path .\first.txt
$lastFile=Get-Content -Path .\last.txt
$passFile=Get-Content -Path .\pass.txt
$groupFile=Get-Content -Path .\groups.txt

$ffl = $firstFile.length
$lfl = $lastFile.length
$pfl = $passFile.length
$gfl = $groupFile.length

$rf = Get-Random -Maximum $ffl
$rl = Get-Random -Maximum $lfl
$rp = Get-Random -Maximum $pfl
$rg = Get-Random -Maximum $gfl

$first=$firstFile[$rf]
$last=$lastFile[$rl]
$full="$first $last"
$pass=ConvertTo-SecureString $passFile[$rp] -AsPlainText -Force
$group=$groupFile[$rg]

for ($i=0; $i -lt 20; $i++{
    $first=$firstFile[$rf]
    $last=$lastFile[$rl]
    $full="$first $last"
    $login="$first[0]$last020167"
    $pass=ConvertTo-SecureString $passFile[$rp] -AsPlainText -Force
    $group=$groupFile[$rg]



}