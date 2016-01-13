<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
require_once __DIR__.'/../app/AppKernel.php';
$kernel = new AppKernel('prod', false);
$kernel->loadClassCache();
$kernel->boot();

$courses = $kernel->getContainer()
                  ->get('doctrine')
                  ->getManager()
                  ->getRepository('ClassCentralSiteBundle:Course')
                  ->findAll();

// Output a JSON dump of all courses
header('Content-Type: application/json');

echo "[\n";

$first = true;

foreach($courses as $c)
{
    $course_serializable = array(
      'name' => $c->getName(),
      'url' => $c->getUrl(),
      'slug' => $c->getSlug(),
      'short_name' => $c->getShortName(),
      'oneliner' => $c->getOneliner(),
      'description' => $c->getDescription(),
      'long_description' => $c->getLongDescription(),
      'syllabus' => $c->getSyllabus(),
      'thumbnail' => $c->getThumbnail(),
      'start_date' => $c->getStartDate(),
      'exact_date_known' => $c->getExactDateKnown(),
      'language' => $c->getLanguage(),
      'created' => $c->getCreated(),
      'modified' => $c->getModified(),
      'video_intro' => $c->getVideoIntro(),
      'length' => $c->getLength(),
      'certificate' => $c->getCertificate(),
      'verified_certificate' => $c->getVerifiedCertificate(),
      'workload_min' => $c->getWorkloadMin(),
      'workload_max' => $c->getWorkloadMax(),
    );

    if($first)
      $first=false;
    else
      echo ",\n";

    echo json_encode($course_serializable);
}

echo "\n]";
