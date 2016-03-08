<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';
$kernel = new AppKernel('dev', true);
$kernel->loadClassCache();
$kernel->boot();

$em = $kernel->getContainer()->get('doctrine')->getManager();

$qb = $em->createQueryBuilder();
$qb->select('c')->from('ClassCentral\SiteBundle\Entity\Course', 'c');

if(isset($_GET['modified_after']))
{
  // Make sure modified_after only contains an integer and nothing else, just to be sure
  $modified_timestamp = intval($_GET['modified_after']);
  $modified_date = date('Y-m-d H:i:s', $modified_timestamp);

  $qb->where("c.modified > '$modified_date'");
}

$query = $qb->getQuery();
$courses = $query->getResult();

// Output a JSON dump of all selected courses
header('Content-Type: application/json');

// Apparently PHP does not like encoding large arrays so we are building the
// array by hand and concatenate the serialized courses
echo "[\n";

$first = true;

foreach($courses as $c)
{
    $language = $c->getLanguage();
    if($language)
      $language_code = $language->getCode();

    $initiative = $c->getInitiative();
    if($initiative)
      $initiative_name = $initiative->getName();

    $course_serializable = array(
      'name' => $c->getName(),
      'url' => $c->getUrl(),
      'slug' => $c->getSlug(),
      'short_name' => $c->getShortName(),
      'description' => $c->getDescription(),
      'long_description' => $c->getLongDescription(),
      'syllabus' => $c->getSyllabus(),
      'initiative' => $initiative_name,
      'thumbnail' => $c->getThumbnail(),
      'start_date' => date('c', $c->getStartDate()),
      'exact_date_known' => $c->getExactDateKnown(),
      'language' => $language_code,
      'video_intro' => $c->getVideoIntro(),
      'length' => $c->getLength(),
      'certificate' => $c->getCertificate(),
      'verified_certificate' => $c->getVerifiedCertificate(),
      'workload_min' => $c->getWorkloadMin(),
      'workload_max' => $c->getWorkloadMax(),
      'created' => $c->getCreated(),
      'modified' => $c->getModified()
    );

    if($first)
      $first=false;
    else
      echo ",\n";

    echo json_encode($course_serializable);
}

echo "\n]";
